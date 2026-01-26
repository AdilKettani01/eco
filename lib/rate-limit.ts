import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production for multi-instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number; // Seconds until reset
}

/**
 * Get client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry or expired, create new one
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit by IP address
 */
export function rateLimitByIP(
  request: NextRequest,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  const ip = getClientIP(request);
  const key = `${endpoint}:${ip}`;
  return checkRateLimit(key, config);
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimiters = {
  // Login: 5 attempts per 15 minutes
  login: (request: NextRequest) =>
    rateLimitByIP(request, 'login', {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
    }),

  // SMS code: 3 requests per 10 minutes
  smsCode: (request: NextRequest) =>
    rateLimitByIP(request, 'sms-code', {
      windowMs: 10 * 60 * 1000,
      maxRequests: 3,
    }),

  // Contact form: 5 submissions per hour
  contactForm: (request: NextRequest) =>
    rateLimitByIP(request, 'contact', {
      windowMs: 60 * 60 * 1000,
      maxRequests: 5,
    }),

  // Booking: 10 per hour
  booking: (request: NextRequest) =>
    rateLimitByIP(request, 'booking', {
      windowMs: 60 * 60 * 1000,
      maxRequests: 10,
    }),

  // API general: 100 requests per minute
  api: (request: NextRequest) =>
    rateLimitByIP(request, 'api', {
      windowMs: 60 * 1000,
      maxRequests: 100,
    }),
};

// Account lockout tracking
const loginAttempts = new Map<string, { count: number; lockedUntil?: number }>();

/**
 * Track failed login attempts and implement account lockout
 */
export function trackLoginAttempt(
  email: string,
  success: boolean
): { locked: boolean; attemptsRemaining?: number; lockoutMinutes?: number } {
  const key = email.toLowerCase();
  const now = Date.now();
  const entry = loginAttempts.get(key);

  // Check if currently locked
  if (entry?.lockedUntil && now < entry.lockedUntil) {
    const lockoutMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
    return { locked: true, lockoutMinutes };
  }

  // If successful login, reset attempts
  if (success) {
    loginAttempts.delete(key);
    return { locked: false };
  }

  // Track failed attempt
  const attempts = (entry?.count || 0) + 1;
  const maxAttempts = 5;
  const lockoutDuration = 15 * 60 * 1000; // 15 minutes

  if (attempts >= maxAttempts) {
    loginAttempts.set(key, {
      count: attempts,
      lockedUntil: now + lockoutDuration,
    });
    return { locked: true, lockoutMinutes: 15 };
  }

  loginAttempts.set(key, { count: attempts });
  return { locked: false, attemptsRemaining: maxAttempts - attempts };
}

/**
 * Check if account is locked
 */
export function isAccountLocked(email: string): { locked: boolean; lockoutMinutes?: number } {
  const key = email.toLowerCase();
  const entry = loginAttempts.get(key);
  const now = Date.now();

  if (entry?.lockedUntil && now < entry.lockedUntil) {
    const lockoutMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
    return { locked: true, lockoutMinutes };
  }

  return { locked: false };
}
