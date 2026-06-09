/**
 * File: src/infra/database/prisma.module.ts
 * Purpose: Global module that provides PrismaService to the entire app.
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
