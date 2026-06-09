/**
 * File: src/modules/users/users.module.ts
 * Purpose: Users feature module — CRUD operations for user profiles.
 */
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
