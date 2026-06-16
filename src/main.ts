/**
 * File: src/main.ts
 * Purpose: Application entry point — bootstraps Fastify, security, Swagger, and global pipes.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyHelmet from '@fastify/helmet';
import fastifyCompress from '@fastify/compress';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter.js';
import { TransformInterceptor } from './core/interceptors/transform.interceptor.js';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor.js';
import { globalValidationPipe } from './core/pipes/validation.pipe.js';
import { DbGuard } from './core/guards/db.guard.js';
import { startViteDevServer } from './shared/utils/vite-dev.helper.js';

async function bootstrap() {
   const logger = new Logger('Bootstrap');
   const isProduction = process.env.NODE_ENV === 'production';

   const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({
         logger: process.env.NODE_ENV !== 'test',
         bodyLimit: parseInt(process.env.BODY_LIMIT || '10485760', 10),
      }),
   );

   const config = app.get(ConfigService);
   const port = config.get<number>('app.port', 5000);
   const corsOrigins = config.get<string[]>('app.corsOrigins', []);

   /* Security: Helmet with dynamic CSP. */
   await app.register(fastifyHelmet, {
      contentSecurityPolicy: isProduction
         ? {
              directives: {
                 defaultSrc: ["'self'"],
                 scriptSrc: ["'self'"],
                 styleSrc: ["'self'", "'unsafe-inline'"],
                 imgSrc: ["'self'", 'data:', 'https:'],
                 connectSrc: ["'self'"],
                 fontSrc: ["'self'"],
                 objectSrc: ["'none'"],
                 upgradeInsecureRequests: [],
              },
           }
         : {
              directives: {
                 defaultSrc: ["'self'"],
                 scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                 styleSrc: ["'self'", "'unsafe-inline'"],
                 connectSrc: ["'self'", 'ws:', 'wss:', 'http://localhost:*'],
              },
           },
   });

   /* CORS configuration. */
   app.enableCors({
      origin: isProduction ? corsOrigins : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
   });

   /* Enable response compression. */
   await app.register(fastifyCompress);

   /* Global API prefix — excludes health endpoint. */
   app.setGlobalPrefix('api/v1', { exclude: ['health'] });

   /* Register global pipes, filters, and interceptors. */
   app.useGlobalPipes(globalValidationPipe);
   app.useGlobalFilters(new GlobalExceptionFilter());
   app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
   /* DbGuard — rejects DB-dependent requests with 503 if DB is not connected. */
   app.useGlobalGuards(app.get(DbGuard));

   /* Swagger docs — */
   const swaggerConfig = config.get('swagger');
   const docBuilder = new DocumentBuilder()
      .setTitle(swaggerConfig?.title ?? 'API Docs')
      .setDescription(swaggerConfig?.description ?? 'Production API')
      .setVersion(swaggerConfig?.version ?? '1.0')
      .addBearerAuth()
      .build();

   const document = SwaggerModule.createDocument(app, docBuilder);
   SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
         persistAuthorization: true,
         docExpansion: 'none',
         filter: true,
      },
      jsonDocumentUrl: 'api/docs.json',
   });

   /* Dev mode — spawn Vite if not already running, proxy all non-API traffic
      to it, and log the local URLs. Skipped entirely in production. */
   if (!isProduction) {
      const clientUrl = config.get<string>('CLIENT_URL', 'http://localhost:5173');
      await startViteDevServer(app, clientUrl);
   }

   /* Start listening on all interfaces. */
   await app.listen(port, '0.0.0.0');
   if (!isProduction) {
      logger.log(`Application running on port ${port}`);
      logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
      logger.log(`Frontend (via Vite proxy): http://localhost:${port}`);
   }
}

bootstrap();
