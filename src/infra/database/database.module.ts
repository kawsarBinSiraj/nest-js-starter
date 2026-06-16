/**
 * File: src/infra/database/database.module.ts
 *
 * Purpose: Global TypeORM module — resilient connection that never crashes
 *          the app if the database is unavailable on startup.
 *
 * Strategy:
 *   - `manualInitialization: true` → TypeORM does NOT auto-connect on boot.
 *   - `dataSourceFactory` fires a background retry loop (fire-and-forget).
 *   - Exponential backoff: 2s → 4s → 8s … capped at MAX_RETRY_DELAY_MS.
 *   - Stops after MAX_RETRY_ATTEMPTS and logs an error (app keeps running).
 *   - `DbGuard` returns HTTP 503 while `DataSource.isInitialized` is false.
 *   - Once the DB comes up the loop exits — no app restart needed.
 */

import { Global, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DbGuard } from '../../core/guards/db.guard.js';

/** First retry wait (ms) */
const INITIAL_RETRY_DELAY_MS = 2_000;
/** Maximum retry wait cap (ms) */
const MAX_RETRY_DELAY_MS = 60_000;
/** Delay multiplier per attempt */
const BACKOFF_MULTIPLIER = 2;
/** Maximum number of connection attempts before giving up */
const MAX_RETRY_ATTEMPTS = 3;

/** Exponential-backoff delay capped at MAX_RETRY_DELAY_MS */
const nextDelay = (attempt: number): number => {
   return Math.min(INITIAL_RETRY_DELAY_MS * BACKOFF_MULTIPLIER ** attempt, MAX_RETRY_DELAY_MS);
};
/** Resolves after `ms` milliseconds */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

@Global()
@Module({
   imports: [
      TypeOrmModule.forRootAsync({
         imports: [ConfigModule],
         inject: [ConfigService],

         useFactory: (config: ConfigService) => {
            const isProd = config.get<string>('app.env') === 'production';
            const isDev = config.get<string>('app.env') === 'development';

            return {
               type: 'postgres' as const,
               url: config.getOrThrow<string>('database.url'),
               autoLoadEntities: true,
               synchronize: !isProd /** use migrations in production */,
               logging: isDev,
               ssl: isProd ? { rejectUnauthorized: false } : false,
               manualInitialization: true /** we drive the connect ourselves */,
               extra: {
                  max: 10,
                  connectionTimeoutMillis: 5_000,
               },
            };
         },

         dataSourceFactory: async (options) => {
            const logger = new Logger('DatabaseModule');
            const dataSource = new DataSource(options!);

            const connectWithRetry = async (): Promise<void> => {
               let attempt = 0;
               while (!dataSource.isInitialized && attempt < MAX_RETRY_ATTEMPTS) {
                  try {
                     await dataSource.initialize();
                     logger.log('Database connected successfully');
                  } catch (err) {
                     const delay = nextDelay(attempt);
                     logger.warn(
                        `Database unavailable (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS}) — ` +
                           `retrying in ${delay / 1_000}s · ${(err as Error).message}`,
                     );
                     await sleep(delay);
                     attempt++;
                  }
               }
               if (!dataSource.isInitialized) {
                  logger.error(`Database unreachable after ${MAX_RETRY_ATTEMPTS} attempts — giving up.`);
               }
            };

            /** Fire-and-forget — app starts immediately, DB connects in background */
            connectWithRetry().catch((err) => logger.error('Unexpected error in DB retry loop', err));
            return dataSource;
         },
      }),
   ],

   providers: [DbGuard],
   exports: [TypeOrmModule, DbGuard],
})
export class DatabaseModule {}
