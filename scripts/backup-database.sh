#!/bin/bash

# Production Database Backup Script for CleanFoss Booking Platform
# Automated PostgreSQL backup with encryption, compression, and rotation

set -euo pipefail

# ===========================================
# CONFIGURATION
# ===========================================

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cleanfoss_db}"
DB_USER="${DB_USER:-cleanfoss_backup}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Backup configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/cleanfoss}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
COMPRESSION_LEVEL="${COMPRESSION_LEVEL:-9}"
ENCRYPT_BACKUPS="${ENCRYPT_BACKUPS:-true}"
GPG_RECIPIENT="${GPG_RECIPIENT:-backup@cleanfoss.com}"

# S3 configuration (optional)
S3_BUCKET="${S3_BUCKET:-}"
S3_PREFIX="${S3_PREFIX:-database-backups}"
AWS_REGION="${AWS_REGION:-eu-west-1}"

# Notification configuration
WEBHOOK_URL="${WEBHOOK_URL:-}"
SLACK_CHANNEL="${SLACK_CHANNEL:-}"

# ===========================================
# FUNCTIONS
# ===========================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >&2
}

error() {
    log "ERROR: $1" >&2
    exit 1
}

send_notification() {
    local status="$1"
    local message="$2"
    
    if [[ -n "$WEBHOOK_URL" ]]; then
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"🗄️ Database Backup [$status]: $message\"}" || true
    fi
    
    if [[ -n "$SLACK_CHANNEL" && -n "$SLACK_WEBHOOK" ]]; then
        curl -s -X POST "$SLACK_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"channel\":\"$SLACK_CHANNEL\",\"text\":\"🗄️ Database Backup [$status]: $message\"}" || true
    fi
}

create_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR" || error "Failed to create backup directory: $BACKUP_DIR"
        log "Created backup directory: $BACKUP_DIR"
    fi
}

check_dependencies() {
    local deps=("pg_dump" "gzip")
    
    if [[ "$ENCRYPT_BACKUPS" == "true" ]]; then
        deps+=("gpg")
    fi
    
    if [[ -n "$S3_BUCKET" ]]; then
        deps+=("aws")
    fi
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error "Required dependency not found: $dep"
        fi
    done
    
    log "All dependencies satisfied"
}

perform_backup() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_filename="cleanfoss_backup_${timestamp}.sql"
    local compressed_filename="${backup_filename}.gz"
    local final_filename="$compressed_filename"
    
    log "Starting database backup..."
    
    # Set password for pg_dump
    export PGPASSWORD="$DB_PASSWORD"
    
    # Create backup with pg_dump
    local backup_path="$BACKUP_DIR/$backup_filename"
    
    pg_dump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=plain \
        --no-owner \
        --no-privileges \
        --file="$backup_path" || error "pg_dump failed"
    
    log "Database dump completed: $backup_path"
    
    # Compress the backup
    gzip -"$COMPRESSION_LEVEL" "$backup_path" || error "Compression failed"
    local compressed_path="$BACKUP_DIR/$compressed_filename"
    
    log "Backup compressed: $compressed_path"
    
    # Encrypt if enabled
    if [[ "$ENCRYPT_BACKUPS" == "true" ]]; then
        gpg --trust-model always \
            --recipient "$GPG_RECIPIENT" \
            --encrypt \
            --armor \
            --output "${compressed_path}.gpg" \
            "$compressed_path" || error "Encryption failed"
        
        # Remove unencrypted file
        rm "$compressed_path"
        final_filename="${compressed_filename}.gpg"
        
        log "Backup encrypted: $BACKUP_DIR/$final_filename"
    fi
    
    # Upload to S3 if configured
    if [[ -n "$S3_BUCKET" ]]; then
        local s3_path="s3://$S3_BUCKET/$S3_PREFIX/$(date +%Y)/$(date +%m)/$final_filename"
        
        aws s3 cp "$BACKUP_DIR/$final_filename" "$s3_path" \
            --region "$AWS_REGION" \
            --storage-class STANDARD_IA || error "S3 upload failed"
        
        log "Backup uploaded to S3: $s3_path"
    fi
    
    # Calculate backup size
    local backup_size=$(du -h "$BACKUP_DIR/$final_filename" | cut -f1)
    
    # Verify backup integrity
    if [[ "$ENCRYPT_BACKUPS" == "true" ]]; then
        gpg --quiet --batch --decrypt "$BACKUP_DIR/$final_filename" | gzip -t || error "Backup integrity check failed"
    else
        gzip -t "$BACKUP_DIR/$final_filename" || error "Backup integrity check failed"
    fi
    
    log "Backup integrity verified"
    
    # Clean up password
    unset PGPASSWORD
    
    echo "$BACKUP_DIR/$final_filename:$backup_size"
}

cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    local deleted_count=0
    
    # Find and delete old local backups
    while IFS= read -r -d '' file; do
        rm "$file"
        ((deleted_count++))
        log "Deleted old backup: $(basename "$file")"
    done < <(find "$BACKUP_DIR" -name "cleanfoss_backup_*.sql.gz*" -mtime +$RETENTION_DAYS -print0)
    
    # Clean up S3 backups if configured
    if [[ -n "$S3_BUCKET" ]]; then
        local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
        
        aws s3 ls "s3://$S3_BUCKET/$S3_PREFIX/" --recursive \
            --region "$AWS_REGION" \
            --query "Contents[?LastModified<'$cutoff_date'].{Key: Key}" \
            --output text | while read -r key; do
            
            if [[ -n "$key" && "$key" == *"cleanfoss_backup_"* ]]; then
                aws s3 rm "s3://$S3_BUCKET/$key" --region "$AWS_REGION"
                ((deleted_count++))
                log "Deleted old S3 backup: $key"
            fi
        done 2>/dev/null || true
    fi
    
    log "Cleanup completed. Deleted $deleted_count old backups"
}

get_database_stats() {
    export PGPASSWORD="$DB_PASSWORD"
    
    psql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --tuples-only \
        --no-align \
        --command="SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null || echo "Unknown"
    
    unset PGPASSWORD
}

# ===========================================
# MAIN EXECUTION
# ===========================================

main() {
    local start_time=$(date +%s)
    
    log "=== CleanFoss Database Backup Started ==="
    log "Timestamp: $(date)"
    log "Database: $DB_NAME@$DB_HOST:$DB_PORT"
    log "Backup Directory: $BACKUP_DIR"
    log "Retention: $RETENTION_DAYS days"
    log "Encryption: $ENCRYPT_BACKUPS"
    
    # Pre-flight checks
    check_dependencies
    create_backup_dir
    
    # Get database stats
    local db_size=$(get_database_stats)
    log "Database size: $db_size"
    
    # Perform backup
    local backup_result
    backup_result=$(perform_backup)
    local backup_file=$(echo "$backup_result" | cut -d: -f1)
    local backup_size=$(echo "$backup_result" | cut -d: -f2)
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Calculate execution time
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local duration_formatted=$(printf '%02d:%02d:%02d' $((duration/3600)) $((duration%3600/60)) $((duration%60)))
    
    log "=== Backup Completed Successfully ==="
    log "Backup file: $(basename "$backup_file")"
    log "Backup size: $backup_size"
    log "Database size: $db_size"
    log "Duration: $duration_formatted"
    
    # Send success notification
    send_notification "SUCCESS" "Backup completed in $duration_formatted. Size: $backup_size (DB: $db_size)"
}

# Error handling
trap 'error "Backup script failed at line $LINENO"' ERR
trap 'send_notification "FAILED" "Backup script interrupted or failed"' EXIT

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

# Reset exit trap on successful completion
trap - EXIT
send_notification "SUCCESS" "Backup completed successfully"
