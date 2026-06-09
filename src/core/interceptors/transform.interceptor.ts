/**
 * File: src/core/interceptors/transform.interceptor.ts
 * Purpose: Wrap every response in { success, data, timestamp } envelope.
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<{ url?: string }>();
    /* Skip wrapping for health check — terminus expects its own response format. */
    if (request.url?.startsWith('/health')) {
      return next.handle() as Observable<ApiResponse<T>>;
    }
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
