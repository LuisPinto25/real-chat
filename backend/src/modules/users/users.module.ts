import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { USER_REPOSITORY_TOKEN } from './domain/repositories/user.repository.interface';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { GetAllUsersHandler } from './application/queries/get-all-users/get-all-users.handler';
import { GetUserByIdHandler } from './application/queries/get-user-by-id/get-user-by-id.handler';
import { UsersController } from './presentation/controllers/users.controller';
import { AuthModule } from '../auth/auth.module';

const QueryHandlers = [GetAllUsersHandler, GetUserByIdHandler];

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [UsersController],
  providers: [
    ...QueryHandlers,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY_TOKEN],
})
export class UsersModule {}
