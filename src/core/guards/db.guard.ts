/**
 * File: src/core/guards/db.guard.ts
 * Purpose: Guard that rejects requests with 503 when the database connection
 *          has not yet been established (or was lost). Applied globally in main.ts.
 */
import { CanActivate, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DbGuard implements CanActivate {
   constructor(
      @InjectDataSource()
      private readonly dataSource: DataSource,
   ) {}

   canActivate(): boolean {
      if (!this.dataSource.isInitialized) {
         throw new ServiceUnavailableException('Database is not available. Try again later.');
      }
      return true;
   }
}
