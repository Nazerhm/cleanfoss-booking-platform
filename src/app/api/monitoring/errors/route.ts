import { NextRequest, NextResponse } from 'next/server'

interface ErrorLogData {
  message: string
  stack?: string
  timestamp: string
  componentStack?: string
  errorBoundary: string
  environment: string
  userAgent: string
  url?: string
  userId?: string
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const errorData: ErrorLogData = await request.json()
    
    // Validate required fields
    if (!errorData.message || !errorData.timestamp) {
      return NextResponse.json(
        { error: 'Missing required error data' },
        { status: 400 }
      )
    }

    // Add additional context
    const enrichedError = {
      ...errorData,
      url: request.url,
      ip: request.ip || 'unknown',
      timestamp: new Date().toISOString(), // Server timestamp
      severity: determineSeverity(errorData.message),
      category: categorizeError(errorData.message)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Frontend Error:', enrichedError)
    }

    // In production, you would send to logging service
    // Examples: Sentry, LogRocket, DataDog, etc.
    await logToService(enrichedError)

    // Store critical errors in database for analysis
    if (enrichedError.severity === 'critical') {
      await storeCriticalError(enrichedError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging endpoint failed:', error)
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    )
  }
}

function determineSeverity(message: string): 'low' | 'medium' | 'high' | 'critical' {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('payment') || lowerMessage.includes('booking')) {
    return 'critical'
  }
  if (lowerMessage.includes('authentication') || lowerMessage.includes('database')) {
    return 'high'
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('timeout')) {
    return 'medium'
  }
  return 'low'
}

function categorizeError(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('payment')) return 'payment'
  if (lowerMessage.includes('booking')) return 'booking'
  if (lowerMessage.includes('auth')) return 'authentication'
  if (lowerMessage.includes('database') || lowerMessage.includes('prisma')) return 'database'
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) return 'network'
  if (lowerMessage.includes('render') || lowerMessage.includes('component')) return 'ui'
  return 'general'
}

async function logToService(errorData: any) {
  // In production, integrate with services like:
  // - Sentry: Sentry.captureException()
  // - DataDog: logger.error()
  // - LogRocket: LogRocket.captureException()
  
  // For now, structured logging to console
  console.error('Application Error:', {
    severity: errorData.severity,
    category: errorData.category,
    message: errorData.message,
    timestamp: errorData.timestamp,
    environment: errorData.environment
  })
  
  // Example Sentry integration (commented out):
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(new Error(errorData.message), {
  //     tags: {
  //       component: errorData.errorBoundary,
  //       category: errorData.category,
  //       severity: errorData.severity
  //     },
  //     extra: errorData
  //   })
  // }
}

async function storeCriticalError(errorData: any) {
  // Store critical errors in database for analysis
  // This would connect to your database and store error details
  
  console.error('CRITICAL ERROR DETECTED:', {
    message: errorData.message,
    timestamp: errorData.timestamp,
    category: errorData.category,
    userAgent: errorData.userAgent,
    stack: errorData.stack?.substring(0, 500) // Truncate for storage
  })
  
  // Example database storage (you would implement with Prisma):
  // await prisma.errorLog.create({
  //   data: {
  //     message: errorData.message,
  //     severity: errorData.severity,
  //     category: errorData.category,
  //     stack: errorData.stack,
  //     timestamp: new Date(errorData.timestamp),
  //     metadata: errorData
  //   }
  // })
}
