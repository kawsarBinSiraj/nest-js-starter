/**
 * File: src/infra/database/prisma.service.ts
 * Purpose: Prisma client wrapper with PrismaPg adapter and lifecycle hooks.
 */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    super({ adapter });
  }

  /* Connect to the database when the module initializes. */
  async onModuleInit() {
    await this.$connect();
  }

  /* Disconnect cleanly when the application shuts down. */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
