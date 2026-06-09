/**
 * File: src/shared/types/jwt-payload.type.ts
 * Purpose: Type definitions for JWT access and refresh token payloads.
 */
import { Role } from '../constants/roles.constant.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload extends JwtPayload {
  refreshToken: string;
}
