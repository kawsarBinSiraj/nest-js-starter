/**
 * File: src/modules/health/health.controller.ts
 * Purpose: GET /health endpoint — pings the database via Prisma.
 */
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../infra/database/prisma.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly healthIndicator: HealthIndicatorService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check service health' })
  check() {
    return this.health.check([
      async () => {
        const indicator = this.healthIndicator.check('database');
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return indicator.up();
        } catch (err) {
          return indicator.down({ message: (err as Error).message });
        }
      },
    ]);
  }
}
