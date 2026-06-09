/**
 * File: src/core/guards/jwt-auth.guard.ts
 * Purpose: Guard that enforces JWT access-token authentication via Passport.
 */
import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
