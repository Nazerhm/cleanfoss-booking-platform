# Monitoring Setup Guide - CleanFoss Booking Platform

## 📊 Monitoring System Overview

The CleanFoss Booking Platform includes a comprehensive monitoring system with error tracking, performance monitoring, structured logging, and health checks. This guide covers the complete setup and configuration.

## 🛠️ Built-in Monitoring Components

### 1. Health Check System (/api/health)

**Purpose**: System health monitoring and status verification  
**Endpoint**: `GET /api/health`  
**Authentication**: Optional secret header

```bash
# Basic health check
curl https://yourdomain.com/api/health

# Authenticated health check
curl -H "x-health-secret: your-secret" https://yourdomain.com/api/health

# Detailed health check
curl -X POST -H "Content-Type: application/json" \
     -d '{"detailed": true}' \
     https://yourdomain.com/api/health
```

**Response Example**:
```json
{
  "timestamp": "2025-09-05T10:30:00.000Z",
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 23,
      "error": null
    },
    "memory": {
      "status": "healthy",
      "usage": 145,
      "limit": 512,
      "percentage": 28
    }
  },
  "responseTime": 45
}
```

### 2. Database Monitoring (/api/monitoring/database)

**Purpose**: Database performance and connection monitoring  
**Endpoint**: `GET /api/monitoring/database`

```bash
curl https://yourdomain.com/api/monitoring/database
```

**Monitored Metrics**:
- Connection pool status
- Active connections count
- Query performance statistics
- Database response times
- Connection errors and timeouts

### 3. Error Tracking System (/api/monitoring/errors)

**Purpose**: Frontend error collection and categorization  
**Endpoint**: `POST /api/monitoring/errors`

**Automatic Integration**: Enabled via ErrorBoundary components

**Error Categories**:
- `payment`: Payment processing errors
- `booking`: Booking system errors  
- `authentication`: Auth-related errors
- `database`: Database connection/query errors
- `network`: Network and API errors
- `ui`: User interface rendering errors

### 4. Performance Monitoring (/api/monitoring/performance)

**Purpose**: Real-time performance metrics collection  
**Endpoint**: `POST /api/monitoring/performance`

**Tracked Metrics**:
- **Core Web Vitals**: CLS, FID, FCP, LCP, TTFB
- **Resource Loading**: JavaScript, CSS, images, API calls
- **User Interactions**: Click response times, form submissions
- **Navigation**: Page load times, route changes

### 5. Structured Logging (/api/monitoring/logs)

**Purpose**: Centralized log aggregation with categorization  
**Endpoint**: `POST /api/monitoring/logs`

**Log Categories**:
- `auth`: Authentication events
- `booking`: Booking process logs
- `payment`: Payment transaction logs
- `database`: Database operation logs
- `security`: Security-related events
- `performance`: Performance-related logs

## 🔧 Monitoring Configuration

### 1. Environment Variables

```env
# Monitoring Configuration
MONITORING_ENABLED=true
HEALTH_CHECK_SECRET=your-32-character-secret

# Log Configuration  
LOG_LEVEL=info                  # debug, info, warn, error, critical
LOG_FORMAT=json                 # json, pretty

# Performance Thresholds
PERFORMANCE_ALERT_THRESHOLD=5000    # ms for critical alerts
ERROR_RATE_THRESHOLD=0.05           # 5% error rate threshold

# External Services
SENTRY_DSN=your-sentry-dsn
SLACK_WEBHOOK_URL=your-slack-webhook
EMAIL_ALERT_ENDPOINT=your-email-service
```

### 2. Alert Configuration

Configure alerts in your environment:

```env
# Slack Alerts
SLACK_CRITICAL_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Email Alerts  
ALERT_EMAIL_ADDRESSES=admin@yourdomain.com,dev@yourdomain.com

# Alert Thresholds
CRITICAL_ERROR_THRESHOLD=10     # Critical errors per minute
HIGH_RESPONSE_TIME_THRESHOLD=2000   # Response time in ms
MEMORY_USAGE_THRESHOLD=90       # Memory usage percentage
```

## 📈 External Monitoring Integration

### 1. Sentry Error Tracking

#### Installation

```bash
npm install @sentry/nextjs @sentry/tracing
```

#### Configuration

Create `sentry.client.config.js`:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.value?.includes('ResizeObserver loop limit exceeded')) {
        return null;
      }
    }
    return event;
  },
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
});
```

Create `sentry.server.config.js`:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 2. DataDog Integration

#### Installation

```bash
npm install dd-trace
```

#### Configuration

Create `datadog.js`:

```javascript
const tracer = require('dd-trace').init({
  env: process.env.NODE_ENV,
  service: 'cleanfoss-booking-platform',
  version: process.env.npm_package_version,
  logInjection: true,
});

module.exports = tracer;
```

Update `next.config.js`:

```javascript
if (process.env.NODE_ENV === 'production') {
  require('./datadog');
}

module.exports = {
  // ... existing configuration
};
```

### 3. New Relic Integration

#### Installation

```bash
npm install newrelic
```

#### Configuration

Create `newrelic.js`:

```javascript
exports.config = {
  app_name: ['CleanFoss Booking Platform'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
    ]
  }
};
```

## 🔔 Alert Configuration

### 1. Slack Integration

```javascript
// In monitoring API endpoints
async function sendSlackAlert(alertData) {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 ${alertData.severity.toUpperCase()}: ${alertData.message}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Environment:* ${alertData.environment}\n*Time:* ${alertData.timestamp}\n*Details:* ${alertData.details}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Health Check'
              },
              url: `${process.env.NEXTAUTH_URL}/api/health`
            }
          ]
        }
      ]
    })
  });
}
```

### 2. Email Alerts

```javascript
async function sendEmailAlert(alertData) {
  if (!process.env.EMAIL_ALERT_ENDPOINT) return;
  
  await fetch(process.env.EMAIL_ALERT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: process.env.ALERT_EMAIL_ADDRESSES?.split(','),
      subject: `🚨 ALERT: ${alertData.severity} - ${alertData.message}`,
      html: `
        <h2>CleanFoss Platform Alert</h2>
        <p><strong>Severity:</strong> ${alertData.severity}</p>
        <p><strong>Environment:</strong> ${alertData.environment}</p>
        <p><strong>Time:</strong> ${alertData.timestamp}</p>
        <p><strong>Message:</strong> ${alertData.message}</p>
        <p><strong>Details:</strong> ${JSON.stringify(alertData.details, null, 2)}</p>
        <p><a href="${process.env.NEXTAUTH_URL}/api/health">Check System Health</a></p>
      `
    })
  });
}
```

## 📊 Monitoring Dashboard Setup

### 1. Grafana Dashboard

Create `monitoring/grafana-dashboard.json`:

```json
{
  "dashboard": {
    "title": "CleanFoss Booking Platform",
    "panels": [
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "avg(http_request_duration_seconds)",
            "legendFormat": "Average Response Time"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "postgresql_connections_active",
            "legendFormat": "Active Connections"
          }
        ]
      }
    ]
  }
}
```

### 2. Prometheus Configuration

Create `monitoring/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'cleanfoss-booking-platform'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/monitoring/metrics'
    scrape_interval: 30s
```

## 🔍 Monitoring Best Practices

### 1. Performance Monitoring

```typescript
// Track critical user journeys
export function trackBookingJourney(step: string, metadata: any) {
  logger.booking(`Booking step: ${step}`, {
    step,
    userId: metadata.userId,
    sessionId: metadata.sessionId,
    timestamp: new Date().toISOString(),
    ...metadata
  });
  
  // Track performance
  performanceMonitor.addMetric({
    name: `booking_step_${step}`,
    value: performance.now(),
    timestamp: Date.now(),
    type: 'custom',
    category: 'booking'
  });
}
```

### 2. Error Context Collection

```typescript
// Enhanced error tracking
export function trackError(error: Error, context: any) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context: {
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: context.userId,
      sessionId: context.sessionId,
      timestamp: new Date().toISOString()
    }
  };
  
  // Send to monitoring
  fetch('/api/monitoring/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorData)
  });
}
```

### 3. Business Metrics Tracking

```typescript
// Track business-critical events
export function trackBusinessEvent(event: string, data: any) {
  logger.info(`Business event: ${event}`, 'business', {
    event,
    value: data.value,
    currency: data.currency,
    userId: data.userId,
    timestamp: new Date().toISOString()
  });
}

// Example usage
trackBusinessEvent('booking_completed', {
  value: 299,
  currency: 'DKK',
  userId: 'user123',
  serviceType: 'premium_wash'
});
```

## 🧪 Testing Monitoring Setup

### 1. Health Check Testing

```bash
# Test basic health check
curl -f https://yourdomain.com/api/health || echo "Health check failed"

# Test authenticated health check
curl -f -H "x-health-secret: $HEALTH_CHECK_SECRET" \
     https://yourdomain.com/api/health || echo "Authenticated health check failed"

# Test detailed health check
curl -X POST -H "Content-Type: application/json" \
     -d '{"detailed": true}' \
     https://yourdomain.com/api/health
```

### 2. Error Tracking Testing

```javascript
// Test error tracking
function testErrorTracking() {
  try {
    throw new Error('Test error for monitoring');
  } catch (error) {
    // This should be captured by error boundaries
    console.error('Test error captured:', error);
  }
}
```

### 3. Performance Monitoring Testing

```javascript
// Test performance tracking
function testPerformanceMonitoring() {
  const startTime = performance.now();
  
  // Simulate some work
  setTimeout(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // This should be captured by performance monitor
    performanceMonitor.addMetric({
      name: 'test_operation',
      value: duration,
      timestamp: Date.now(),
      type: 'custom',
      category: 'test'
    });
  }, 100);
}
```

## ✅ Monitoring Setup Complete

Your comprehensive monitoring system is now configured and ready! The CleanFoss Booking Platform includes:

- ✅ **Health Checks**: System status monitoring
- ✅ **Error Tracking**: Automatic error capture and categorization
- ✅ **Performance Monitoring**: Real-time Web Vitals and metrics
- ✅ **Structured Logging**: Centralized log aggregation
- ✅ **Alert System**: Critical issue notifications
- ✅ **External Integration**: Ready for Sentry, DataDog, New Relic
- ✅ **Business Metrics**: Track key user journeys and conversions

Monitor your application's health at: `https://yourdomain.com/api/health`
