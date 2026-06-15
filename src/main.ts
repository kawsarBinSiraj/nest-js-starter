/**
 * File: src/main.ts
 * Purpose: Application entry point — bootstraps Fastify, security, Swagger, and global pipes.
 */
import { spawn } from 'child_process';
import { createConnection } from 'net';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyHelmet from '@fastify/helmet';
import fastifyCompress from '@fastify/compress';
import replyFrom from '@fastify/reply-from';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter.js';
import { TransformInterceptor } from './core/interceptors/transform.interceptor.js';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor.js';
import { globalValidationPipe } from './core/pipes/validation.pipe.js';
import { DbGuard } from './core/guards/db.guard.js';

/* Resolve the Vite dev port from a full URL or a plain port string. */
function resolvePort(urlOrPort: string, fallback: number): number {
   if (urlOrPort.includes('://')) {
      return parseInt(new URL(urlOrPort).port || String(fallback), 10);
   }
   return parseInt(urlOrPort, 10) || fallback;
}

/* Returns true if something is already listening on the given port. */
async function isPortListening(port: number): Promise<boolean> {
   return new Promise((resolve) => {
      const socket = createConnection({ port, host: '127.0.0.1' });
      socket.once('connect', () => {
         socket.destroy();
         resolve(true);
      });
      socket.once('error', () => resolve(false));
   });
}

async function bootstrap() {
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
   app.setGlobalPrefix('api/v1', {
      exclude: ['health'],
   });

   /* Register global pipes, filters, interceptors, and guards. */
   app.useGlobalPipes(globalValidationPipe);
   app.useGlobalFilters(new GlobalExceptionFilter());
   app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
   /* DbGuard rejects all requests with 503 while the DB is not yet connected. */
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

   /* Dev mode: auto-spawn the Vite dev server and proxy all non-API requests to it.
      Using an onRequest hook avoids the Fastify "not found handler already set" conflict with NestJS. */
   if (!isProduction) {
      const clientUrl = config.get<string>('CLIENT_URL', 'http://localhost:5173');
      const clientPort = resolvePort(clientUrl, 5173);

      /* Spawn Vite only if it isn't already running (guards against watch-mode restarts). */
      const viteRunning = await isPortListening(clientPort);
      if (!viteRunning) {
         const vite = spawn('npx', ['vite', '--config', 'client/vite.config.ts'], {
            stdio: 'inherit',
            shell: process.platform === 'win32',
         });
         vite.on('error', (err) => console.error('[Vite] Failed to start:', err.message));
         const killVite = () => {
            try {
               vite.kill('SIGTERM');
            } catch {
               /* already gone */
            }
         };
         process.once('exit', killVite);
         process.once('SIGINT', () => {
            killVite();
            process.exit(0);
         });
         process.once('SIGTERM', () => {
            killVite();
            process.exit(0);
         });
         console.log(`[Vite] Starting dev server on port ${clientPort}...`);
      }

      const fastify = app.getHttpAdapter().getInstance();
      await fastify.register(replyFrom, { base: clientUrl });
      fastify.addHook('onRequest', async (request, reply) => {
         const url = request.url;
         if (!url.startsWith('/api') && url !== '/health') {
            return reply.from(url, {
               onError: (_reply, _err) => {
                  _reply.statusCode = 503;
                  _reply.send({
                     success: false,
                     statusCode: 503,
                     message: 'Frontend is starting up — please refresh in a moment.',
                  });
               },
            });
         }
      });
   }

   /* Start listening on all interfaces. */
   await app.listen(port, '0.0.0.0');
   if (!isProduction) {
      console.log(`Application running on port ${port}`);
      console.log(`Swagger docs: http://localhost:${port}/api/docs`);
      console.log(`Frontend (via Vite proxy): http://localhost:${port}`);
   }
}

bootstrap();
