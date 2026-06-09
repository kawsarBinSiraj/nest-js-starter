/**
 * File: src/modules/users/dto/update-user.dto.ts
 * Purpose: Validate user profile update — optional firstName and lastName.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;
}
