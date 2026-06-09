/**
 * File: src/config/swagger.config.ts
 * Purpose: Register Swagger/OpenAPI doc title, description, and version.
 */
import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  title: process.env.SWAGGER_TITLE || 'API Docs',
  description: process.env.SWAGGER_DESCRIPTION || 'Production ready NestJS API',
  version: process.env.SWAGGER_VERSION || '1.0',
  path: 'api/docs',
}));
