/**
 * File: src/app.module.ts
 * Purpose: Root module — imports config, infra, feature modules, and rate limiting.
 *
 * NestJS Request Execution Order:
 * ┌─────────────────────────────────────────────────────────┐
 * │ 1. Middleware        → CorrelationId, RequestLogger     │
 * │ 2. Guards            → DbGuard, JwtAuthGuard, Roles     │
 * │ 3. Interceptors (pre)→ LoggingInterceptor               │
 * │ 4. Pipes             → ValidationPipe                   │
 * │ 5. Route Handler     → Controller method                │
 * │ 6. Interceptors (post)→ TransformInterceptor            │
 * │ 7. Exception Filters → GlobalExceptionFilter            │
 * └─────────────────────────────────────────────────────────┘
 */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import appConfig from './config/app.config.js';
import authConfig from './config/auth.config.js';
import clientConfig from './config/client.config.js';
import databaseConfig from './config/database.config.js';
import swaggerConfig from './config/swagger.config.js';
import { validateEnv } from './config/env.validation.js';
import { DatabaseModule } from './infra/database/database.module.js';
import { LoggerModule } from './infra/logger/logger.module.js';
import { MailModule } from './infra/mail/mail.module.js';
import { AppCacheModule } from './infra/cache/cache.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { CorrelationIdMiddleware, RequestLoggerMiddleware } from './core/middleware/index.js';

@Module({
   imports: [
      /* Config (global) */
      ConfigModule.forRoot({
         isGlobal: true,
         load: [appConfig, authConfig, clientConfig, databaseConfig, swaggerConfig],
         validate: validateEnv,
      }),

      /* Rate limiting — global defaults; auth routes override to 10/min. */
      ThrottlerModule.forRoot([
         {
            name: 'global',
            ttl: 60000,
            limit: 100,
         },
      ]),

      /* Serve SPA static files in production — in dev the Vite proxy handles frontend routing. */
      ...(process.env.NODE_ENV === 'production'
         ? [
              ServeStaticModule.forRootAsync({
                 imports: [ConfigModule],
                 inject: [ConfigService],
                 useFactory: (config: ConfigService) => [
                    {
                       rootPath: join(process.cwd(), config.get<string>('client.distPath', 'dist/public')),
                       exclude: ['/api/{*path}', '/health'],
                       serveStaticOptions: {
                          setHeaders: (res, filePath) => {
                             if (filePath.endsWith('index.html')) {
                                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                             }
                          },
                       },
                    },
                 ],
              }),
           ]
         : []),

      /* Infrastructure */
      DatabaseModule,
      LoggerModule,
      MailModule,
      AppCacheModule,

      /* Feature modules */
      AuthModule,
      UsersModule,
      HealthModule,
   ],
})

/**
 * Middleware executes FIRST in the NestJS pipeline (before Guards).
 * Order within middleware matters — CorrelationId runs before RequestLogger
 * so the logger can include the correlation ID.
 */
export class AppModule implements NestModule {
   configure(consumer: MiddlewareConsumer) {
      consumer.apply(CorrelationIdMiddleware, RequestLoggerMiddleware).forRoutes('*');
   }
}
