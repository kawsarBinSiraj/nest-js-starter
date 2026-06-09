/**
 * File: src/modules/health/health.module.ts
 * Purpose: Health-check module using @nestjs/terminus.
 */
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
