/**
 * File: src/core/filters/global-exception.filter.ts
 * Purpose: Catch all exceptions and return a standardized error response.
 */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

/* Duck-type check for terminus HealthCheckError without importing the deprecated class. */
function isHealthCheckError(err: unknown): err is HttpException & { causes: unknown } {
   return err instanceof HttpException && err.getStatus() === HttpStatus.SERVICE_UNAVAILABLE && 'causes' in err;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
   private readonly logger = new Logger(GlobalExceptionFilter.name);

   catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const reply = ctx.getResponse<FastifyReply>();
      const request = ctx.getRequest<FastifyRequest>();

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let message: string | string[] = 'Internal server error';
      let causes: unknown;

      /* Health check failures — return terminus causes for visibility. */
      if (isHealthCheckError(exception)) {
         statusCode = HttpStatus.SERVICE_UNAVAILABLE;
         message = exception.message;
         causes = exception.causes;
      } else if (exception instanceof HttpException) {
         statusCode = exception.getStatus();
         const response = exception.getResponse();
         message = typeof response === 'string' ? response : (response as any).message || message;
      } else if (exception instanceof Error) {
         this.logger.error(
            `Unhandled error on ${request.method} ${request.url}: ${exception.message}`,
            exception.stack,
         );
      }

      const body: Record<string, unknown> = {
         success: false,
         statusCode,
         message: Array.isArray(message) ? message.join(', ') : message,
         timestamp: new Date().toISOString(),
         path: request.url,
      };

      /* Include health check causes only when present. */
      if (causes !== undefined) {
         body.causes = causes;
      }

      reply.status(statusCode).send(body);
   }
}
