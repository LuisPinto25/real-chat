import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../../auth/domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllExcept(excludedUserId: string): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: excludedUserId },
      },
      orderBy: { name: 'asc' },
    });
    return users.map((u) => UserEntity.fromPrisma(u));
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? UserEntity.fromPrisma(user) : null;
  }
}
