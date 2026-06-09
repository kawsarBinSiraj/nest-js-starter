/**
 * File: src/modules/auth/dto/reset-password.dto.ts
 * Purpose: Validate reset-password payload — token and new password (min 8).
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token received via email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  password: string;
}
