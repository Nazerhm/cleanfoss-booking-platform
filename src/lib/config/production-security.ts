/**
 * Production Security Configuration
 * Enhanced security settings for production deployment
 */

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
const isLocal = process.env.NEXTAUTH_URL?.includes('localhost');

// Production Security Headers
export const PRODUCTION_SECURITY_HEADERS = {
  // Existing security headers from development
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Enhanced Production Headers
  'Strict-Transport-Security': isProduction 
    ? `max-age=${process.env.HSTS_MAX_AGE || 31536000}; includeSubDomains; preload`
    : undefined,
    
  'Content-Security-Policy': isProduction 
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com",
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
        "font-src 'self' fonts.gstatic.com",
        "img-src 'self' data: https: *.stripe.com",
        "connect-src 'self' *.stripe.com api.stripe.com",
        "frame-src 'self' *.stripe.com",
        `report-uri ${process.env.CSP_REPORT_URI || '/api/security/csp-report'}`
      ].join('; ')
    : undefined,
    
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Production CORS Configuration
export const PRODUCTION_CORS_CONFIG = {
  origin: isProduction 
    ? [process.env.CORS_ORIGIN || process.env.NEXTAUTH_URL]
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization', 
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
    'Accept-Version',
    'Content-Length',
    'Content-MD5',
    'Date',
    'X-Api-Version'
  ]
};

// Production Rate Limiting Configuration
export const PRODUCTION_RATE_LIMITS = {
  // Global API rate limit
  global: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  },
  
  // Authentication endpoints - stricter limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for auth
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: false,
  },
  
  // API endpoints - moderate limits
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: parseInt(process.env.API_RATE_LIMIT_PER_MINUTE || '60'),
    message: 'API rate limit exceeded, please try again later.',
  },
  
  // Booking endpoints - business logic limits
  booking: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // limit booking creation attempts
    message: 'Too many booking attempts, please try again later.',
  }
};

// Production Database Configuration
export const PRODUCTION_DATABASE_CONFIG = {
  // Connection pool settings optimized for production
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
    }
  },
  
  // Enhanced connection pool for production
  pool: {
    max: parseInt(process.env.DATABASE_POOL_MAX || '20'),
    min: parseInt(process.env.DATABASE_POOL_MIN || '5'),
    acquire: parseInt(process.env.DATABASE_POOL_TIMEOUT || '30000'),
    idle: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT || '300000'),
  },
  
  // Production logging
  log: isProduction 
    ? ['error', 'warn']
    : ['query', 'info', 'warn', 'error'],
};

// Production Authentication Configuration
export const PRODUCTION_AUTH_CONFIG = {
  // Enhanced session configuration for production
  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800'), // 7 days
    updateAge: parseInt(process.env.SESSION_UPDATE_AGE || '86400'), // 1 day
  },
  
  // JWT configuration
  jwt: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800'), // 7 days
    encryption: isProduction, // Enable JWT encryption in production
  },
  
  // Cookies configuration for production
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction, // Only send cookie over HTTPS in production
        domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
      }
    },
    callbackUrl: {
      name: isProduction ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax', 
        path: '/',
        secure: isProduction,
        domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
      }
    },
    csrfToken: {
      name: isProduction ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      }
    }
  },
  
  // Enhanced security options
  useSecureCookies: isProduction,
  trustHost: isProduction,
};

// Production Monitoring Configuration
export const PRODUCTION_MONITORING_CONFIG = {
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: !isProduction,
    enableFile: isProduction,
  },
  
  // Health check configuration
  healthCheck: {
    secret: process.env.HEALTH_CHECK_SECRET,
    endpoints: [
      '/api/health',
      '/api/health/database',
      '/api/health/auth',
    ]
  },
  
  // Performance monitoring
  performance: {
    enabled: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
    sampleRate: parseFloat(process.env.PERFORMANCE_SAMPLE_RATE || '0.1'),
  }
};

// Export configuration object based on environment
export const getSecurityConfig = () => ({
  headers: PRODUCTION_SECURITY_HEADERS,
  cors: PRODUCTION_CORS_CONFIG,
  rateLimits: PRODUCTION_RATE_LIMITS,
  database: PRODUCTION_DATABASE_CONFIG,
  auth: PRODUCTION_AUTH_CONFIG,
  monitoring: PRODUCTION_MONITORING_CONFIG,
  isProduction,
  isLocal,
});
