import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { envs } from '../../config/envs';
import { AUTH_REPOSITORY_TOKEN } from './domain/repositories/auth.repository.interface';
import { PrismaAuthRepository } from './infrastructure/repositories/prisma-auth.repository';
import { PasswordHasherService } from './infrastructure/services/password-hasher.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { RegisterHandler } from './application/commands/register/register.handler';
import { LoginHandler } from './application/commands/login/login.handler';
import { AuthController } from './presentation/controllers/auth.controller';

const CommandHandlers = [RegisterHandler, LoginHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: envs.jwtSecret,
      signOptions: { expiresIn: envs.jwtExpiresIn as any },
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    PasswordHasherService,
    JwtStrategy,
    {
      provide: AUTH_REPOSITORY_TOKEN,
      useClass: PrismaAuthRepository,
    },
  ],
  exports: [JwtModule, PassportModule, AUTH_REPOSITORY_TOKEN],
})
export class AuthModule {}
