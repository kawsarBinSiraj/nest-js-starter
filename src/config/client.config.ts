/**
 * File: src/config/client.config.ts
 * Purpose: Register client SPA dist path for static file serving.
 */
import { registerAs } from '@nestjs/config';

export default registerAs('client', () => ({
  distPath: process.env.CLIENT_DIST_PATH || 'dist/public',
  indexFile: 'index.html',
}));
