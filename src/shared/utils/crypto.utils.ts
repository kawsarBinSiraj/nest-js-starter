/**
 * File: src/shared/utils/crypto.utils.ts
 * Purpose: Secure random token generation and SHA-256 hashing helpers.
 */
import * as crypto from 'crypto';

/* Generate a cryptographically secure random hex token. */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/* SHA-256 hash a token for safe database storage. */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
