import { nanoid } from 'nanoid';

/**
 * Generate a random 8-character alphanumeric hash for session URL paths
 * Uses nanoid for cryptographically strong random generation
 * @returns {string} 8-character random hash
 */
export function generateSessionHash(): string {
  return nanoid(8);
}

/**
 * Extract session hash from URL pathname
 * Handles paths like /abc12345/admin/dashboard or /abc12345/dashboard
 * @param {string} pathname - The URL pathname
 * @returns {string | null} Extracted hash or null if no valid hash found
 */
export function extractHashFromPath(pathname: string): string | null {
  // Extract hash from paths like /abc12345/admin/dashboard or /abc12345/dashboard
  const pathMatch = pathname.match(/^\/([a-zA-Z0-9_-]{8})(\/|$)/);
  return pathMatch ? pathMatch[1] : null;
}

/**
 * Validate hash format
 * Ensures hash is alphanumeric and of correct length (8 characters)
 * @param {string} hash - The hash to validate
 * @returns {boolean} True if valid format
 */
export function isValidHashFormat(hash: string): boolean {
  // Must be 8 characters, alphanumeric (a-z, A-Z, 0-9, -, _)
  const hashRegex = /^[a-zA-Z0-9_-]{8}$/;
  return hashRegex.test(hash);
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
 * Construct full URL with hash-based path
 * @param {string} hash - The session hash
 * @param {string} [path='/'] - Optional path to append (e.g., '/admin/dashboard')
 * @returns {string} Full URL with hash path (e.g., https://ecolimpio.es/abc12345/admin/dashboard)
 */
export function constructHashPathUrl(hash: string, path: string = '/'): string {
  const baseDomain = getBaseDomain();
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${protocol}://${baseDomain}/${hash}${cleanPath}`;
}
