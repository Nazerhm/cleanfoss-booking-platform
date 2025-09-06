import { NextRequest, NextResponse } from 'next/server'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'navigation' | 'resource' | 'measure' | 'custom'
  category?: string
}

interface SessionInfo {
  userAgent: string
  viewport: string
  connection: string
  memory?: {
    used: number
    total: number
    limit: number
  }
}

interface PerformanceData {
  metrics: PerformanceMetric[]
  session: SessionInfo
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const data: PerformanceData = await request.json()
    
    if (!data.metrics || !Array.isArray(data.metrics)) {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      )
    }

    // Process and categorize metrics
    const processedMetrics = data.metrics.map(metric => ({
      ...metric,
      severity: assessPerformanceSeverity(metric),
      timestamp_server: new Date().toISOString(),
      ip: request.ip || 'unknown'
    }))

    // Log performance issues
    const slowMetrics = processedMetrics.filter(m => m.severity === 'high' || m.severity === 'critical')
    if (slowMetrics.length > 0) {
      console.warn('Performance Issues Detected:', {
        count: slowMetrics.length,
        metrics: slowMetrics.map(m => ({ name: m.name, value: m.value, category: m.category })),
        session: data.session.viewport,
        connection: data.session.connection
      })
    }

    // Store metrics for analysis
    await storePerformanceMetrics(processedMetrics, data.session)

    // Generate alerts for critical performance issues
    const criticalMetrics = processedMetrics.filter(m => m.severity === 'critical')
    if (criticalMetrics.length > 0) {
      await generatePerformanceAlerts(criticalMetrics, data.session)
    }

    return NextResponse.json({ 
      success: true,
      processed: processedMetrics.length,
      issues: slowMetrics.length
    })
  } catch (error) {
    console.error('Performance monitoring endpoint failed:', error)
    return NextResponse.json(
      { error: 'Failed to process performance metrics' },
      { status: 500 }
    )
  }
}

function assessPerformanceSeverity(metric: PerformanceMetric): 'low' | 'medium' | 'high' | 'critical' {
  const { name, value, type, category } = metric

  // Critical thresholds
  if (category === 'page' && value > 10000) return 'critical' // Page load > 10s
  if (category === 'web_vitals' && name === 'cls' && value > 0.25) return 'critical' // Poor CLS
  if (category === 'web_vitals' && name === 'fid' && value > 300) return 'critical' // Poor FID
  if (name.includes('booking') && value > 5000) return 'critical' // Slow booking operations

  // High severity thresholds
  if (category === 'page' && value > 5000) return 'high' // Page load > 5s
  if (category === 'api' && value > 3000) return 'high' // API calls > 3s
  if (type === 'resource' && value > 2000) return 'high' // Slow resources > 2s
  if (category === 'web_vitals' && name === 'fid' && value > 100) return 'high'

  // Medium severity thresholds
  if (category === 'page' && value > 3000) return 'medium' // Page load > 3s
  if (category === 'api' && value > 1000) return 'medium' // API calls > 1s
  if (type === 'resource' && value > 1000) return 'medium' // Resources > 1s

  return 'low'
}

async function storePerformanceMetrics(metrics: any[], session: SessionInfo) {
  // In production, store in database for analysis
  // Group metrics by category for efficient storage
  const groupedMetrics = metrics.reduce((groups, metric) => {
    const key = metric.category || 'general'
    if (!groups[key]) groups[key] = []
    groups[key].push(metric)
    return groups
  }, {} as Record<string, any[]>)

  // Log structured performance data
  console.info('Performance Metrics Collected:', {
    timestamp: new Date().toISOString(),
    session: {
      viewport: session.viewport,
      connection: session.connection,
      memory_used_mb: session.memory ? Math.round(session.memory.used / 1024 / 1024) : null
    },
    metrics_summary: Object.entries(groupedMetrics).map(([category, categoryMetrics]) => ({
      category,
      count: (categoryMetrics as any[]).length,
      avg_value: Math.round((categoryMetrics as any[]).reduce((sum: number, m: any) => sum + m.value, 0) / (categoryMetrics as any[]).length),
      max_value: Math.max(...(categoryMetrics as any[]).map((m: any) => m.value))
    }))
  })

  // Example database storage (implement with Prisma in production):
  // await prisma.performanceMetric.createMany({
  //   data: metrics.map(metric => ({
  //     name: metric.name,
  //     value: metric.value,
  //     type: metric.type,
  //     category: metric.category,
  //     severity: metric.severity,
  //     timestamp: new Date(metric.timestamp),
  //     sessionInfo: session
  //   }))
  // })
}

async function generatePerformanceAlerts(criticalMetrics: any[], session: SessionInfo) {
  const alertData = {
    timestamp: new Date().toISOString(),
    severity: 'critical',
    type: 'performance',
    metrics_count: criticalMetrics.length,
    worst_metrics: criticalMetrics
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(m => ({ name: m.name, value: m.value, category: m.category })),
    session_info: {
      viewport: session.viewport,
      connection: session.connection,
      user_agent: session.userAgent.substring(0, 100) // Truncate
    }
  }

  console.error('CRITICAL PERFORMANCE ALERT:', alertData)

  // In production, send alerts via:
  // - Email/SMS to development team
  // - Slack/Discord webhooks
  // - Monitoring service notifications (PagerDuty, etc.)
  
  // Example Slack webhook (implement in production):
  // if (process.env.SLACK_WEBHOOK_URL) {
  //   await fetch(process.env.SLACK_WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       text: `🚨 Critical Performance Issues Detected`,
  //       blocks: [
  //         {
  //           type: 'section',
  //           text: {
  //             type: 'mrkdwn',
  //             text: `*Critical Performance Issues:* ${criticalMetrics.length} issues detected`
  //           }
  //         },
  //         {
  //           type: 'section',
  //           fields: alertData.worst_metrics.map(m => ({
  //             type: 'mrkdwn',
  //             text: `*${m.name}:* ${Math.round(m.value)}ms`
  //           }))
  //         }
  //       ]
  //     })
  //   })
  // }
}
