/**
 * File: src/infra/logger/logger.module.ts
 * Purpose: Global module that provides AppLogger for structured JSON logging.
 */
import { Global, Module } from '@nestjs/common';
import { AppLogger } from './logger.service.js';

@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
