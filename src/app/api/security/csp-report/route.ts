/**
 * Content Security Policy (CSP) Violation Reporting
 * Endpoint to receive and log CSP violations for security monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

interface CSPViolation {
  'document-uri': string;
  'referrer': string;
  'violated-directive': string;
  'effective-directive': string;
  'original-policy': string;
  'disposition': string;
  'blocked-uri': string;
  'line-number': number;
  'column-number': number;
  'source-file': string;
  'status-code': number;
  'script-sample': string;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    // Handle both application/json and application/csp-report
    let violation: CSPViolation;
    
    if (contentType?.includes('application/csp-report')) {
      const body = await request.text();
      const parsed = JSON.parse(body);
      violation = parsed['csp-report'] || parsed;
    } else {
      const body = await request.json();
      violation = body['csp-report'] || body;
    }
    
    // Extract useful information for logging
    const violationInfo = {
      timestamp: new Date().toISOString(),
      documentUri: violation['document-uri'],
      violatedDirective: violation['violated-directive'],
      blockedUri: violation['blocked-uri'],
      sourceFile: violation['source-file'],
      lineNumber: violation['line-number'],
      columnNumber: violation['column-number'],
      originalPolicy: violation['original-policy'],
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      referer: request.headers.get('referer')
    };
    
    // In production, you might want to:
    // 1. Send to external logging service (Sentry, LogRocket, etc.)
    // 2. Store in database for analysis
    // 3. Alert on critical violations
    
    console.warn('🚨 CSP Violation Detected:', JSON.stringify(violationInfo, null, 2));
    
    // Filter out common false positives
    const isKnownFalsePositive = (
      violation['blocked-uri']?.includes('chrome-extension://') ||
      violation['blocked-uri']?.includes('moz-extension://') ||
      violation['blocked-uri']?.includes('safari-extension://') ||
      violation['blocked-uri']?.includes('about:blank') ||
      violation['source-file']?.includes('extension')
    );
    
    if (!isKnownFalsePositive) {
      // Log legitimate violations
      console.error('🔒 Legitimate CSP Violation:', {
        directive: violation['violated-directive'],
        blocked: violation['blocked-uri'],
        source: violation['source-file'],
        line: violation['line-number']
      });
      
      // In production, send to monitoring service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to external service
        // await sendToMonitoringService(violationInfo);
      }
    }
    
    // Always return 204 No Content for CSP reports
    return new NextResponse(null, { status: 204 });
    
  } catch (error) {
    console.error('Error processing CSP violation report:', error);
    
    // Return 400 for malformed reports
    return NextResponse.json(
      { error: 'Invalid CSP report format' },
      { status: 400 }
    );
  }
}

// Handle GET requests with information about CSP reporting
export async function GET() {
  return NextResponse.json({
    message: 'CSP Violation Reporting Endpoint',
    method: 'POST',
    contentType: ['application/csp-report', 'application/json'],
    description: 'This endpoint receives Content Security Policy violation reports',
    status: 'active'
  });
}
