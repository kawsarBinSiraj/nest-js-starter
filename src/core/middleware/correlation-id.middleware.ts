/**
 * File: src/core/middleware/correlation-id.middleware.ts
 * Purpose: Attach a unique X-Correlation-ID header to every request/response for distributed tracing.
 * Execution order: 1 (Middleware — runs before Guards, Interceptors, Pipes).
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
   use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
      const existingId = req.headers[CORRELATION_ID_HEADER] as string | undefined;
      const correlationId = existingId || randomUUID();

      /* Attach to request for downstream access (guards, interceptors, handlers). */
      req.headers[CORRELATION_ID_HEADER] = correlationId;

      /* Echo back in response so clients can trace their request. */
      res.setHeader(CORRELATION_ID_HEADER, correlationId);

      next();
   }
}
