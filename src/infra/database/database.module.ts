/**
 * File: src/infra/database/database.module.ts
 * Purpose: Global TypeORM module — resilient connection that does not crash
 *          the app on startup if the database is unavailable.
 */
import { Global, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DbGuard } from '../../core/guards/db.guard.js';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        const isProd = config.get<string>('app.env') === 'production';
        const isDev = config.get<string>('app.env') === 'development';

        return {
          type: 'postgres' as const,
          url: config.getOrThrow<string>('database.url'),
          autoLoadEntities: true,
          /* synchronize is only safe in development — use migrations in production */
          synchronize: !isProd,
          logging: isDev,
          ssl: isProd ? { rejectUnauthorized: false } : false,

          /*
           * Retry on startup — the app stays alive while TypeORM keeps trying.
           * NestJS will NOT throw / crash as long as retryAttempts > 0.
           * Set to 0 in tests to fail fast.
           */
          retryAttempts: isProd ? 10 : 3,
          retryDelay: 3000, // ms between each retry

          /* Connection pool */
          extra: {
            max: 10,
            connectionTimeoutMillis: 5000,
          },

        };
      },
    }),
  ],
  exports: [TypeOrmModule, DbGuard],
  providers: [DbGuard],
})
export class DatabaseModule {}
