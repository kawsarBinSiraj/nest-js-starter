/**
 * File: src/modules/auth/strategies/jwt-refresh.strategy.ts
 * Purpose: Passport strategy that validates refresh tokens against the stored bcrypt hash.
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { FastifyRequest } from 'fastify';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../infra/database/prisma.service.js';
import { JwtPayload } from '../../../shared/types/jwt-payload.type.js';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('auth.jwtRefreshSecret'),
      passReqToCallback: true,
    } as any);
  }

  async validate(req: FastifyRequest, payload: JwtPayload) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException();

    const refreshToken = authHeader.replace('Bearer', '').trim();

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Refresh token invalid or revoked');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    return { ...user, refreshToken };
  }
}
