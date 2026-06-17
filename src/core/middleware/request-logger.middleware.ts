/**
 * File: src/core/middleware/request-logger.middleware.ts
 * Purpose: Log every incoming HTTP request at the earliest stage (before Guards).
 * Execution order: 1 (Middleware — runs before Guards, Interceptors, Pipes).
 */
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { CORRELATION_ID_HEADER } from './correlation-id.middleware.js';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
   private readonly logger = new Logger('RequestLogger');

   use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
      const { method, url, headers } = req;
      const correlationId = headers[CORRELATION_ID_HEADER] || '-';
      const userAgent = headers['user-agent'] || '-';
      const ip = req.socket?.remoteAddress || '-';

      this.logger.log(
         `→ ${method} ${url} | ip=${ip} | correlationId=${correlationId} | ua=${userAgent}`,
      );

      next();
   }
}
