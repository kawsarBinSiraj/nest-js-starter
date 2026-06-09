/**
 * File: src/core/interceptors/logging.interceptor.ts
 * Purpose: Log HTTP method, URL, status code, and response duration.
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { FastifyRequest } from 'fastify';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const reply = context.switchToHttp().getResponse();
        const statusCode: number = reply.statusCode;
        const duration = Date.now() - start;
        this.logger.log(`${method} ${url} ${statusCode} +${duration}ms`);
      }),
    );
  }
}
