/**
 * File: src/core/decorators/roles.decorator.ts
 * Purpose: Set required roles metadata on route handlers for RolesGuard.
 */
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../shared/constants/roles.constant.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
