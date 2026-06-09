/**
 * File: src/config/database.config.ts
 * Purpose: Register database connection URL from environment.
 */
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));
