import { nanoid } from 'nanoid';
import { NextRequest } from 'next/server';

/**
 * Generate a random 8-character alphanumeric subdomain
 * Uses nanoid for cryptographically strong random generation
 * @returns {string} 8-character random subdomain
 */
export function generateSubdomain(): string {
  return nanoid(8);
}

/**
 * Extract subdomain from request hostname
 * Handles various environments (localhost, production, preview)
 * @param {NextRequest} request - The Next.js request object
 * @returns {string | null} Extracted subdomain or null if main domain
 */
export function getSubdomain(request: NextRequest): string | null {
  const hostname = request.headers.get('host') || '';

  // Handle localhost development (e.g., subdomain.localhost:3000)
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0];
    }
    return null;
  }

  // Handle production/staging domains
  // Expected format: subdomain.ecolimpio.es or subdomain.ecolimpio.vercel.app
  const parts = hostname.split('.');

  // If only 2 parts (e.g., ecolimpio.es), it's the main domain
  if (parts.length <= 2) {
    return null;
  }

  // If 3+ parts, first part is subdomain (unless it's 'www')
  const subdomain = parts[0];

  if (subdomain === 'www') {
    return null;
  }

  return subdomain;
}

/**
 * Check if a given hostname is the main domain (not a subdomain)
 * @param {string} hostname - The hostname to check
 * @returns {boolean} True if main domain, false if subdomain
 */
export function isMainDomain(hostname: string): boolean {
  const subdomain = getSubdomainFromHostname(hostname);
  return subdomain === null;
}

/**
 * Extract subdomain from hostname string
 * Helper function for isMainDomain
 * @param {string} hostname - The hostname string
 * @returns {string | null} Extracted subdomain or null
 */
function getSubdomainFromHostname(hostname: string): string | null {
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0];
    }
    return null;
  }

  const parts = hostname.split('.');

  if (parts.length <= 2) {
    return null;
  }

  const subdomain = parts[0];

  if (subdomain === 'www') {
    return null;
  }

  return subdomain;
}

/**
 * Validate subdomain format
 * Ensures subdomain is alphanumeric and of correct length
 * @param {string} subdomain - The subdomain to validate
 * @returns {boolean} True if valid format
 */
export function isValidSubdomainFormat(subdomain: string): boolean {
  // Must be 8 characters, alphanumeric (a-z, A-Z, 0-9, -, _)
  const subdomainRegex = /^[a-zA-Z0-9_-]{8}$/;
  return subdomainRegex.test(subdomain);
}

/**
 * Get the base domain from environment or default
 * @returns {string} Base domain (e.g., ecolimpio.es)
 */
export function getBaseDomain(): string {
  if (process.env.NODE_ENV === 'development') {
    return 'localhost:3000';
  }

  // Extract from NEXTAUTH_URL or NEXT_PUBLIC_APP_URL
  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ecolimpio.es';
  const url = new URL(appUrl);
  return url.host;
}

/**
 * Construct full subdomain URL
 * @param {string} subdomain - The subdomain
 * @param {string} [path='/'] - Optional path to append
 * @returns {string} Full URL with subdomain
 */
export function constructSubdomainUrl(subdomain: string, path: string = '/'): string {
  const baseDomain = getBaseDomain();
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

  if (baseDomain.includes('localhost')) {
    return `${protocol}://${subdomain}.${baseDomain}${path}`;
  }

  return `${protocol}://${subdomain}.${baseDomain}${path}`;
}
