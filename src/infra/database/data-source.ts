/**
 * File: src/infra/database/data-source.ts
 * Purpose: Standalone TypeORM DataSource used by the TypeORM CLI for migrations.
 *
 * Usage:
 *   npx typeorm-ts-node-esm migration:generate -d src/infra/database/data-source.ts src/infra/database/migrations/InitialSchema
 *   npx typeorm-ts-node-esm migration:run     -d src/infra/database/data-source.ts
 *   npx typeorm-ts-node-esm migration:revert  -d src/infra/database/data-source.ts
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User],
  migrations: ['src/infra/database/migrations/*.ts'],
  synchronize: false,
});
