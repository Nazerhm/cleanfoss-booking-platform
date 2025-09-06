// Structured logging utility for production monitoring
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  category: string
  metadata?: Record<string, any>
  userId?: string
  sessionId?: string
  requestId?: string
  environment: string
}

interface LoggerConfig {
  minLevel: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  bufferSize: number
  flushInterval: number
}

class StructuredLogger {
  private config: LoggerConfig
  private buffer: LogEntry[] = []
  private flushTimer?: NodeJS.Timeout

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    critical: 4
  }

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      enableConsole: true,
      enableRemote: process.env.NODE_ENV === 'production',
      bufferSize: 50,
      flushInterval: 10000, // 10 seconds
      ...config
    }

    if (this.config.enableRemote) {
      this.startFlushTimer()
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.config.minLevel]
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    category: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      metadata,
      environment: process.env.NODE_ENV || 'development'
    }
  }

  private formatConsoleMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.substring(11, 19) // Just time
    const level = entry.level.toUpperCase().padEnd(5)
    const category = `[${entry.category}]`.padEnd(12)
    return `${timestamp} ${level} ${category} ${entry.message}`
  }

  private log(level: LogLevel, message: string, category: string, metadata?: Record<string, any>) {
    if (!this.shouldLog(level)) return

    const entry = this.createLogEntry(level, message, category, metadata)

    // Console logging
    if (this.config.enableConsole) {
      const formattedMessage = this.formatConsoleMessage(entry)
      
      switch (level) {
        case 'debug':
          console.debug(formattedMessage, metadata)
          break
        case 'info':
          console.info(formattedMessage, metadata)
          break
        case 'warn':
          console.warn(formattedMessage, metadata)
          break
        case 'error':
          console.error(formattedMessage, metadata)
          break
        case 'critical':
          console.error(`🚨 ${formattedMessage}`, metadata)
          break
      }
    }

    // Remote logging
    if (this.config.enableRemote) {
      this.buffer.push(entry)
      if (this.buffer.length >= this.config.bufferSize) {
        this.flush()
      }
    }
  }

  debug(message: string, category: string = 'general', metadata?: Record<string, any>) {
    this.log('debug', message, category, metadata)
  }

  info(message: string, category: string = 'general', metadata?: Record<string, any>) {
    this.log('info', message, category, metadata)
  }

  warn(message: string, category: string = 'general', metadata?: Record<string, any>) {
    this.log('warn', message, category, metadata)
  }

  error(message: string, category: string = 'error', metadata?: Record<string, any>) {
    this.log('error', message, category, metadata)
  }

  critical(message: string, category: string = 'critical', metadata?: Record<string, any>) {
    this.log('critical', message, category, metadata)
    // Immediately flush critical errors
    if (this.config.enableRemote) {
      this.flush()
    }
  }

  // Specialized logging methods
  auth(message: string, metadata?: Record<string, any>) {
    this.info(message, 'auth', metadata)
  }

  booking(message: string, metadata?: Record<string, any>) {
    this.info(message, 'booking', metadata)
  }

  payment(message: string, metadata?: Record<string, any>) {
    this.info(message, 'payment', metadata)
  }

  database(message: string, metadata?: Record<string, any>) {
    this.info(message, 'database', metadata)
  }

  api(message: string, metadata?: Record<string, any>) {
    this.info(message, 'api', metadata)
  }

  performance(message: string, metadata?: Record<string, any>) {
    this.info(message, 'performance', metadata)
  }

  security(message: string, metadata?: Record<string, any>) {
    this.warn(message, 'security', metadata)
  }

  // Error tracking methods
  trackError(error: Error, category: string = 'error', metadata?: Record<string, any>) {
    this.error(error.message, category, {
      ...metadata,
      stack: error.stack,
      name: error.name
    })
  }

  trackCriticalError(error: Error, category: string = 'critical', metadata?: Record<string, any>) {
    this.critical(error.message, category, {
      ...metadata,
      stack: error.stack,
      name: error.name
    })
  }

  // User action tracking
  trackUserAction(action: string, userId?: string, metadata?: Record<string, any>) {
    this.info(`User action: ${action}`, 'user', {
      ...metadata,
      userId,
      action
    })
  }

  // Business metrics
  trackBusinessMetric(metric: string, value: number, metadata?: Record<string, any>) {
    this.info(`Business metric: ${metric}`, 'metrics', {
      ...metadata,
      metric,
      value
    })
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush()
      }
    }, this.config.flushInterval)
  }

  private async flush() {
    if (this.buffer.length === 0) return

    const entries = [...this.buffer]
    this.buffer = []

    try {
      if (typeof fetch !== 'undefined') {
        await fetch('/api/monitoring/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries })
        })
      }
    } catch (error) {
      console.error('Failed to send logs to remote service:', error)
      // Put entries back in buffer for retry (with limit to prevent infinite growth)
      if (this.buffer.length < this.config.bufferSize) {
        this.buffer.unshift(...entries.slice(0, this.config.bufferSize - this.buffer.length))
      }
    }
  }

  async destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    await this.flush()
  }
}

// Export singleton logger instance
export const logger = new StructuredLogger()

// React hook for component-specific logging
export function useLogger(componentName: string) {
  return {
    debug: (message: string, metadata?: Record<string, any>) => 
      logger.debug(message, `component:${componentName}`, metadata),
    info: (message: string, metadata?: Record<string, any>) => 
      logger.info(message, `component:${componentName}`, metadata),
    warn: (message: string, metadata?: Record<string, any>) => 
      logger.warn(message, `component:${componentName}`, metadata),
    error: (message: string, metadata?: Record<string, any>) => 
      logger.error(message, `component:${componentName}`, metadata),
    trackUserAction: (action: string, metadata?: Record<string, any>) =>
      logger.trackUserAction(`${componentName}: ${action}`, undefined, metadata)
  }
}

// Middleware logging helper
export function createRequestLogger(requestId: string) {
  return {
    info: (message: string, metadata?: Record<string, any>) =>
      logger.info(message, 'request', { ...metadata, requestId }),
    error: (message: string, metadata?: Record<string, any>) =>
      logger.error(message, 'request', { ...metadata, requestId }),
    trackApiCall: (method: string, path: string, duration: number, status: number) =>
      logger.api(`${method} ${path}`, { requestId, duration, status })
  }
}
