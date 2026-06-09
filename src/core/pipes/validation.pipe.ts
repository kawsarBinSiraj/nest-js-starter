/**
 * File: src/core/pipes/validation.pipe.ts
 * Purpose: Global validation pipe with whitelist, transform, and strict mode.
 */
import { ValidationPipe } from '@nestjs/common';

export const globalValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
});
