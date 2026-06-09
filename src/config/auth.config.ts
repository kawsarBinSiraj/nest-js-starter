/**
 * File: src/config/auth.config.ts
 * Purpose: Register JWT secrets, token expiry, and bcrypt salt rounds.
 */
import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET || 'super-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-change-me',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
}));
