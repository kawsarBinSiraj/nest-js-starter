/**
 * File: src/modules/health/health.module.ts
 * Purpose: Health-check module.
 */
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
