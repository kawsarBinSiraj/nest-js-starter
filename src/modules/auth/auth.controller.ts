/**
 * File: src/modules/auth/auth.controller.ts
 * Purpose: Auth endpoints — signup, login, logout, refresh, forgot/reset password.
 */
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { JwtRefreshGuard } from '../../core/guards/jwt-refresh.guard.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { Role } from '../../shared/constants/roles.constant.js';

@ApiTags('auth')
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Post('signup')
   @HttpCode(HttpStatus.CREATED)
   @ApiOperation({ summary: 'Register a new user' })
   @ApiResponse({ status: 201, description: 'User registered successfully' })
   @ApiResponse({ status: 400, description: 'Email already in use' })
   signup(@Body() dto: SignupDto) {
      return this.authService.signup(dto);
   }

   @Post('login')
   @HttpCode(HttpStatus.OK)
   @ApiOperation({ summary: 'Authenticate and get tokens' })
   @ApiResponse({ status: 200, description: 'Login successful' })
   @ApiResponse({ status: 401, description: 'Invalid credentials' })
   login(@Body() dto: LoginDto) {
      return this.authService.login(dto);
   }

   @Post('logout')
   @HttpCode(HttpStatus.NO_CONTENT)
   @UseGuards(JwtAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ summary: 'Logout and revoke refresh token' })
   logout(@CurrentUser('id') userId: string) {
      return this.authService.logout(userId);
   }

   @Post('refresh')
   @HttpCode(HttpStatus.OK)
   @UseGuards(JwtRefreshGuard)
   @ApiBearerAuth()
   @ApiOperation({ summary: 'Refresh access token using refresh token' })
   refresh(@CurrentUser() user: { id: string; email: string; role: Role }) {
      return this.authService.refreshTokens(user.id, user.email, user.role);
   }

   @Post('forgot-password')
   @HttpCode(HttpStatus.OK)
   @ApiOperation({ summary: 'Send password reset email' })
   @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
   forgotPassword(@Body() dto: ForgotPasswordDto) {
      return this.authService.forgotPassword(dto);
   }

   @Post('reset-password')
   @HttpCode(HttpStatus.OK)
   @ApiOperation({ summary: 'Reset password with token' })
   @ApiResponse({ status: 200, description: 'Password reset successful' })
   @ApiResponse({ status: 400, description: 'Invalid or expired token' })
   resetPassword(@Body() dto: ResetPasswordDto) {
      return this.authService.resetPassword(dto);
   }
}
