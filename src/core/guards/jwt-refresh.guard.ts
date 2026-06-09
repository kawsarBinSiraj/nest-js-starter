/**
 * File: src/core/guards/jwt-refresh.guard.ts
 * Purpose: Guard that enforces JWT refresh-token authentication via Passport.
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
