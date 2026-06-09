/**
 * File: src/infra/cache/cache.module.ts
 * Purpose: Global in-memory cache module with configurable TTL and max entries.
 */
import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>('CACHE_TTL', 60) * 1000,
        max: config.get<number>('CACHE_MAX', 100),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  exports: [NestCacheModule],
})
export class AppCacheModule {}
