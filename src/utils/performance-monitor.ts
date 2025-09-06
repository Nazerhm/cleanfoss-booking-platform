// Performance monitoring utilities for production
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'navigation' | 'resource' | 'measure' | 'custom'
  category?: string
}

interface WebVitals {
  CLS: number // Cumulative Layout Shift
  FID: number // First Input Delay  
  FCP: number // First Contentful Paint
  LCP: number // Largest Contentful Paint
  TTFB: number // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private isEnabled: boolean = false

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production'
    if (this.isEnabled && typeof window !== 'undefined') {
      this.initializeMonitoring()
    }
  }

  private initializeMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectNavigationMetrics()
        this.collectResourceMetrics()
      }, 0)
    })

    // Monitor Web Vitals
    this.setupWebVitalsTracking()

    // Send metrics periodically
    setInterval(() => {
      if (this.metrics.length > 0) {
        this.sendMetrics()
      }
    }, 30000) // Send every 30 seconds
  }

  private collectNavigationMetrics() {
    if (!window.performance || !window.performance.timing) return

    const timing = window.performance.timing
    const metrics = [
      {
        name: 'dns_lookup',
        value: timing.domainLookupEnd - timing.domainLookupStart,
        timestamp: Date.now(),
        type: 'navigation' as const,
        category: 'network'
      },
      {
        name: 'tcp_connect',
        value: timing.connectEnd - timing.connectStart,
        timestamp: Date.now(),
        type: 'navigation' as const,
        category: 'network'
      },
      {
        name: 'ttfb',
        value: timing.responseStart - timing.navigationStart,
        timestamp: Date.now(),
        type: 'navigation' as const,
        category: 'server'
      },
      {
        name: 'dom_ready',
        value: timing.domContentLoadedEventEnd - timing.navigationStart,
        timestamp: Date.now(),
        type: 'navigation' as const,
        category: 'dom'
      },
      {
        name: 'page_load',
        value: timing.loadEventEnd - timing.navigationStart,
        timestamp: Date.now(),
        type: 'navigation' as const,
        category: 'page'
      }
    ]

    this.addMetrics(metrics)
  }

  private collectResourceMetrics() {
    if (!window.performance || !window.performance.getEntriesByType) return

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const slowResources = resources
      .filter(resource => resource.duration > 1000) // Resources taking >1s
      .map(resource => ({
        name: `slow_resource_${this.getResourceType(resource.name)}`,
        value: resource.duration,
        timestamp: Date.now(),
        type: 'resource' as const,
        category: 'performance'
      }))

    this.addMetrics(slowResources)
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript'
    if (url.includes('.css')) return 'stylesheet'
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
    if (url.includes('/api/')) return 'api'
    return 'other'
  }

  private setupWebVitalsTracking() {
    // Web Vitals tracking (would need web-vitals library in production)
    // For now, basic CLS and FID tracking

    let cumulativeLayoutShift = 0
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Track Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            cumulativeLayoutShift += entry.value
          }
        }
        
        this.addMetric({
          name: 'cls',
          value: cumulativeLayoutShift,
          timestamp: Date.now(),
          type: 'custom',
          category: 'web_vitals'
        })
      })

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.warn('Layout shift tracking not supported')
      }

      // Track First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as any[]) {
          this.addMetric({
            name: 'fid',
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now(),
            type: 'custom',
            category: 'web_vitals'
          })
        }
      })

      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        console.warn('First Input Delay tracking not supported')
      }
    }
  }

  public addMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return
    this.metrics.push(metric)

    // Alert on critical performance issues
    if (metric.value > 5000 && metric.category === 'page') {
      console.warn(`Slow page load detected: ${metric.value}ms`)
    }
  }

  public addMetrics(metrics: PerformanceMetric[]) {
    if (!this.isEnabled) return
    this.metrics.push(...metrics)
  }

  public measureFunction<T>(fn: () => T, name: string, category?: string): T {
    if (!this.isEnabled) return fn()

    const startTime = performance.now()
    const result = fn()
    const endTime = performance.now()

    this.addMetric({
      name: `function_${name}`,
      value: endTime - startTime,
      timestamp: Date.now(),
      type: 'measure',
      category: category || 'function'
    })

    return result
  }

  public async measureAsync<T>(
    fn: () => Promise<T>, 
    name: string, 
    category?: string
  ): Promise<T> {
    if (!this.isEnabled) return fn()

    const startTime = performance.now()
    const result = await fn()
    const endTime = performance.now()

    this.addMetric({
      name: `async_${name}`,
      value: endTime - startTime,
      timestamp: Date.now(),
      type: 'measure',
      category: category || 'async'
    })

    return result
  }

  public trackUserTiming(name: string, category: string = 'user') {
    if (!this.isEnabled) return

    if (typeof window !== 'undefined' && window.performance) {
      const startMark = `${name}_start`
      const endMark = `${name}_end`
      const measureName = `${name}_duration`

      return {
        start: () => {
          window.performance.mark(startMark)
        },
        end: () => {
          window.performance.mark(endMark)
          window.performance.measure(measureName, startMark, endMark)
          
          const measure = window.performance.getEntriesByName(measureName)[0]
          if (measure) {
            this.addMetric({
              name: measureName,
              value: measure.duration,
              timestamp: Date.now(),
              type: 'measure',
              category
            })
          }
        }
      }
    }

    return { start: () => {}, end: () => {} }
  }

  private async sendMetrics() {
    if (this.metrics.length === 0) return

    try {
      const response = await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: this.metrics,
          session: this.getSessionInfo(),
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        this.metrics = [] // Clear sent metrics
      }
    } catch (error) {
      console.error('Failed to send performance metrics:', error)
    }
  }

  private getSessionInfo() {
    return {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const trackRender = (componentName: string) => {
    const timing = performanceMonitor.trackUserTiming(`render_${componentName}`, 'react')
    if (timing) {
      timing.start()
      return () => timing.end()
    }
    return () => {}
  }

  const trackAsyncOperation = async <T>(
    operation: () => Promise<T>,
    name: string
  ): Promise<T> => {
    return performanceMonitor.measureAsync(operation, name, 'react')
  }

  return {
    trackRender,
    trackAsyncOperation,
    addMetric: performanceMonitor.addMetric.bind(performanceMonitor)
  }
}
