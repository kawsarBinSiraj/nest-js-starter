/**
 * File: src/infra/logger/logger.service.ts
 * Purpose: Transient JSON logger — suppresses debug in prod, silent in test.
 */
import { Injectable, LoggerService, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    this.print('LOG', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.print('ERROR', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.print('WARN', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      this.print('DEBUG', message, optionalParams);
    }
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.print('VERBOSE', message, optionalParams);
  }

  private print(level: string, message: any, params: any[]) {
    if (process.env.NODE_ENV === 'test') return;

    const timestamp = new Date().toISOString();
    const ctx = params[params.length - 1] ?? this.context ?? 'App';
    const logEntry = {
      level,
      timestamp,
      context: ctx,
      message,
    };
    if (level === 'ERROR') {
      console.error(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }
}
