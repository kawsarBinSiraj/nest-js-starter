/**
 * File: src/modules/auth/dto/forgot-password.dto.ts
 * Purpose: Validate forgot-password payload — just the email address.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}
