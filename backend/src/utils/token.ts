import crypto from 'crypto';

// Generate a cryptographically secure random token (URL-safe)
export function generateToken(size = 64): string {
  return crypto.randomBytes(size).toString('base64url');
}

// Hash the token using SHA-256 for storage/lookup
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
