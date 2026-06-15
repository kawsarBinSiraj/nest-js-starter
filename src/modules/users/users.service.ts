/**
 * File: src/modules/users/users.service.ts
 * Purpose: User data access — find, update, delete with safe field selection.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

const USER_SELECT: Record<keyof User, boolean> = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
  // sensitive fields excluded
  password: false,
  refreshToken: false,
  resetPasswordToken: false,
  resetPasswordExpiry: false,
} as const;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find({
      select: USER_SELECT,
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id); // ensures 404 if not found
    await this.userRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userRepository.delete(id);
  }
}
