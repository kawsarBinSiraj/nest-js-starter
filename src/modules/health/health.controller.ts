/**
 * File: src/modules/health/health.controller.ts
 * Purpose: GET /health endpoint — pings the database via TypeORM DataSource.
 */
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly healthIndicator: HealthIndicatorService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check service health' })
  check() {
    return this.health.check([
      async () => {
        const indicator = this.healthIndicator.check('database');
        try {
          await this.dataSource.query('SELECT 1');
          return indicator.up();
        } catch (err) {
          return indicator.down({ message: (err as Error).message });
        }
      },
    ]);
  }
}
