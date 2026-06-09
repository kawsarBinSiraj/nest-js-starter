/**
 * File: src/config/app.config.ts
 * Purpose: Register app-level config (port, CORS origins, body limit).
 */
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
   env: process.env.NODE_ENV || 'development',
   port: parseInt(process.env.PORT || '5000', 10),
   apiPrefix: process.env.API_PREFIX || 'api/v1',
   corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()) : '*',
   bodyLimit: parseInt(process.env.BODY_LIMIT || '10485760', 10), // 10mb
}));
