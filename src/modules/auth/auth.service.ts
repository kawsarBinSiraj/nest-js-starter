/**
 * File: src/modules/auth/auth.service.ts
 * Purpose: Core auth logic — credentials check, token generation, password reset.
 */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity.js';
import { MailService } from '../../infra/mail/mail.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { JwtPayload } from '../../shared/types/jwt-payload.type.js';
import { Role } from '../../shared/constants/roles.constant.js';
import { generateSecureToken, hashToken } from '../../shared/utils/crypto.utils.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /* Register a new user, hash password, send welcome email, return tokens. */
  async signup(dto: SignupDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const saltRounds = this.config.get<number>('auth.bcryptSaltRounds', 12);
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    await this.userRepository.save(user);

    await this.mailService.sendSignupEmail(
      user.email,
      user.firstName ?? user.email,
    );

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  /* Verify email/password, generate access + refresh tokens. */
  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  /* Revoke the user's refresh token on logout. */
  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  /* Issue a new access + refresh token pair. */
  async refreshTokens(userId: string, email: string, role: Role) {
    const tokens = await this.generateTokens(userId, email, role);
    await this.updateRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  /* Generate a reset token, store its hash, and email the raw token. */
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    /* Always return success to prevent email enumeration. */
    if (!user) return;

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepository.update(user.id, {
      resetPasswordToken: tokenHash,
      resetPasswordExpiry: expiry,
    });

    await this.mailService.sendForgotPasswordEmail(
      user.email,
      user.firstName ?? user.email,
      rawToken,
    );
  }

  /* Validate the reset token, update the password, revoke all sessions. */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = hashToken(dto.token);

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: tokenHash,
        resetPasswordExpiry: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const saltRounds = this.config.get<number>('auth.bcryptSaltRounds', 12);
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
      refreshToken: null,
    });

    await this.mailService.sendResetPasswordEmail(
      user.email,
      user.firstName ?? user.email,
    );
  }

  /* Sign access and refresh JWTs concurrently. */
  private async generateTokens(userId: string, email: string, role: Role) {
    const payload: JwtPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('auth.jwtSecret'),
        expiresIn: this.config.get<string>('auth.jwtExpiresIn', '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('auth.jwtRefreshSecret'),
        expiresIn: this.config.get<string>(
          'auth.jwtRefreshExpiresIn',
          '7d',
        ) as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /* Bcrypt-hash the refresh token before storing in the database. */
  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, { refreshToken: hashed });
  }

  /* Strip sensitive fields before returning user data. */
  private sanitizeUser(user: User) {
    const { password, refreshToken, resetPasswordToken, ...safe } = user;
    return safe;
  }
}
