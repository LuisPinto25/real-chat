import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? UserEntity.fromPrisma(user) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? UserEntity.fromPrisma(user) : null;
  }

  async create(userData: {
    name: string;
    email: string;
    password: string;
    avatar?: string;
  }): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: userData,
    });

    return UserEntity.fromPrisma(user);
  }
}
