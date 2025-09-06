'use client'

import React, { ReactNode, useEffect } from 'react'
import { performanceMonitor } from '../utils/performance-monitor'
import { logger } from '../utils/logger'

interface PerformanceMonitorProviderProps {
  children: ReactNode
}

export function PerformanceMonitorProvider({ children }: PerformanceMonitorProviderProps) {
  useEffect(() => {
    // Initialize performance monitoring
    if (process.env.NODE_ENV === 'production') {
      // Track initial page load
      const loadTimer = performanceMonitor.trackUserTiming('initial_page_load', 'navigation')
      if (loadTimer) {
        loadTimer.start()
        
        // End timing when page is fully loaded
        const handleLoad = () => {
          loadTimer.end()
          window.removeEventListener('load', handleLoad)
        }
        
        window.addEventListener('load', handleLoad)
      }

      // Track route changes in Next.js
      const trackRouteChange = () => {
        logger.info('Route change detected', 'navigation', {
          path: window.location.pathname,
          timestamp: new Date().toISOString()
        })
      }

      // Listen for Next.js route changes
      window.addEventListener('beforeunload', () => {
        logger.info('Page unloading', 'navigation', {
          path: window.location.pathname,
          duration: performance.now()
        })
      })

      // Track page visibility changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          logger.info('Page hidden', 'user', {
            path: window.location.pathname
          })
        } else {
          logger.info('Page visible', 'user', {
            path: window.location.pathname
          })
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      // Track errors that escape error boundaries
      const handleUnhandledError = (event: ErrorEvent) => {
        logger.trackCriticalError(
          new Error(event.message),
          'unhandled',
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            path: window.location.pathname
          }
        )
      }

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        logger.trackCriticalError(
          new Error(String(event.reason)),
          'unhandled_promise',
          {
            path: window.location.pathname,
            reason: event.reason
          }
        )
      }

      window.addEventListener('error', handleUnhandledError)
      window.addEventListener('unhandledrejection', handleUnhandledRejection)

      // Cleanup on unmount
      return () => {
        window.removeEventListener('error', handleUnhandledError)
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [])

  return <>{children}</>
}

// Hook for tracking user interactions
export function useUserTracking() {
  const trackClick = (elementName: string, metadata?: Record<string, any>) => {
    logger.trackUserAction(`click_${elementName}`, undefined, {
      ...metadata,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    })
  }

  const trackFormSubmit = (formName: string, success: boolean, metadata?: Record<string, any>) => {
    logger.trackUserAction(`form_submit_${formName}`, undefined, {
      ...metadata,
      success,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    })
  }

  const trackBookingStep = (step: string, data?: Record<string, any>) => {
    logger.booking(`Booking step: ${step}`, {
      ...data,
      step,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    })
  }

  const trackPaymentAction = (action: string, data?: Record<string, any>) => {
    logger.payment(`Payment action: ${action}`, {
      ...data,
      action,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    })
  }

  return {
    trackClick,
    trackFormSubmit,
    trackBookingStep,
    trackPaymentAction
  }
}
