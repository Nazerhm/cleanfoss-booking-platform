-- Production Database Optimization Scripts
-- PostgreSQL 17 Performance Tuning for CleanFoss Booking Platform

-- ===========================================
-- INDEX OPTIMIZATION FOR PRODUCTION
-- ===========================================

-- User authentication indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email ON "User"(email) WHERE status = 'ACTIVE';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_company ON "User"(companyId) WHERE status = 'ACTIVE';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_role ON "User"(role);

-- Booking engine performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_user ON "Booking"(userId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_company ON "Booking"(companyId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_status ON "Booking"(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_date ON "Booking"("bookingDate") WHERE status != 'CANCELLED';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_booking_created ON "Booking"("createdAt");

-- Time slot optimization for booking availability
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timeslot_location_date ON "TimeSlot"(locationId, date) WHERE available = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timeslot_company ON "TimeSlot"(companyId) WHERE available = true;

-- Service catalog performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_company ON "Service"(companyId) WHERE active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_category ON "Service"(categoryId) WHERE active = true;

-- Customer vehicle lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_user ON "CustomerVehicle"(userId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vehicle_brand_model ON "CustomerVehicle"(carBrandId, carModelId);

-- Payment and invoice tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_booking ON "Invoice"(bookingId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_user ON "Invoice"(userId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_status ON "Invoice"(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_invoice ON "Payment"(invoiceId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_status ON "Payment"(status);

-- NextAuth session optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_userid ON "Session"(userId);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_expires ON "Session"(expires);

-- ===========================================
-- PERFORMANCE OPTIMIZATION SETTINGS
-- ===========================================

-- Connection and memory settings (adjust based on server specs)
-- These would typically be set in postgresql.conf

/*
Production PostgreSQL Configuration Recommendations:

# Connection Settings
max_connections = 100                    # Adjust based on expected load
shared_buffers = 256MB                   # 25% of available RAM (for 1GB RAM server)
effective_cache_size = 1GB              # 75% of available RAM

# Query Performance
work_mem = 4MB                          # Per-query memory allocation
maintenance_work_mem = 64MB             # For maintenance operations
random_page_cost = 1.1                 # SSD optimization (default is 4.0 for HDD)

# Write Performance
checkpoint_completion_target = 0.9       # Spread checkpoints over 90% of interval
wal_buffers = 16MB                      # Write-ahead logging buffer
max_wal_size = 1GB                      # Maximum WAL size

# Query Planning
default_statistics_target = 100         # Statistics collection detail
effective_io_concurrency = 200          # Concurrent I/O operations (SSD)

# Logging for Production
log_min_duration_statement = 1000       # Log queries taking > 1 second
log_checkpoints = on                    # Log checkpoint activity
log_connections = on                    # Log connections
log_disconnections = on                 # Log disconnections
log_lock_waits = on                     # Log lock waits
*/

-- ===========================================
-- DATABASE MAINTENANCE AUTOMATION
-- ===========================================

-- Auto-vacuum settings for production tables
ALTER TABLE "User" SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE "Booking" SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE "TimeSlot" SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE "Service" SET (autovacuum_vacuum_scale_factor = 0.2);

-- ===========================================
-- QUERY PERFORMANCE ANALYSIS
-- ===========================================

-- Enable query statistics collection
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Function to analyze slow queries (for database monitoring)
CREATE OR REPLACE FUNCTION get_slow_queries(min_duration_ms INTEGER DEFAULT 1000)
RETURNS TABLE (
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    query TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pss.calls,
        pss.total_exec_time,
        pss.mean_exec_time,
        pss.query
    FROM pg_stat_statements pss
    WHERE pss.mean_exec_time > min_duration_ms
    ORDER BY pss.mean_exec_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- BACKUP AND MAINTENANCE PROCEDURES
-- ===========================================

-- Function to get database size information
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins + n_tup_upd as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) + pg_indexes_size(schemaname||'.'||tablename)) as total_size
    FROM pg_stat_user_tables
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- SECURITY HARDENING
-- ===========================================

-- Create read-only user for reporting/analytics
DO $$
BEGIN
    -- Create reporting user if not exists
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cleanfoss_readonly') THEN
        CREATE ROLE cleanfoss_readonly WITH LOGIN PASSWORD 'secure_readonly_password_here';
    END IF;
    
    -- Grant read-only permissions
    GRANT CONNECT ON DATABASE cleanfoss_db TO cleanfoss_readonly;
    GRANT USAGE ON SCHEMA public TO cleanfoss_readonly;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO cleanfoss_readonly;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO cleanfoss_readonly;
END
$$;

-- Create backup user
DO $$
BEGIN
    -- Create backup user if not exists
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cleanfoss_backup') THEN
        CREATE ROLE cleanfoss_backup WITH LOGIN PASSWORD 'secure_backup_password_here';
    END IF;
    
    -- Grant backup permissions
    GRANT CONNECT ON DATABASE cleanfoss_db TO cleanfoss_backup;
    GRANT USAGE ON SCHEMA public TO cleanfoss_backup;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO cleanfoss_backup;
    GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO cleanfoss_backup;
END
$$;

-- ===========================================
-- MONITORING AND ALERTS
-- ===========================================

-- View for monitoring connection usage
CREATE OR REPLACE VIEW connection_monitor AS
SELECT 
    state,
    COUNT(*) as connection_count,
    MAX(state_change) as last_state_change
FROM pg_stat_activity 
WHERE datname = current_database()
GROUP BY state;

-- View for monitoring table bloat
CREATE OR REPLACE VIEW table_bloat_monitor AS
SELECT 
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    ROUND(n_dead_tup::NUMERIC / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) as bloat_percentage
FROM pg_stat_user_tables
WHERE n_live_tup + n_dead_tup > 0
ORDER BY bloat_percentage DESC;

-- ===========================================
-- PRODUCTION HEALTH CHECK QUERIES
-- ===========================================

-- Query to check database health metrics
SELECT 
    'Database Size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value
UNION ALL
SELECT 
    'Active Connections',
    COUNT(*)::TEXT
FROM pg_stat_activity 
WHERE datname = current_database() AND state = 'active'
UNION ALL
SELECT 
    'Idle Connections',
    COUNT(*)::TEXT
FROM pg_stat_activity 
WHERE datname = current_database() AND state = 'idle'
UNION ALL
SELECT 
    'Total Tables',
    COUNT(*)::TEXT
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY metric;
