import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginCommand } from './login.command';
import { AuthResponseDto } from '../../dtos/auth.dto';
import {
  AUTH_REPOSITORY_TOKEN,
  IAuthRepository,
} from '../../../domain/repositories/auth.repository.interface';
import { PasswordHasherService } from '../../../infrastructure/services/password-hasher.service';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<
  LoginCommand,
  AuthResponseDto
> {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const { email, password } = command.dto;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.authRepository.findByEmail(normalizedEmail);

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await this.passwordHasher.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, name: user.name };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    };
  }
}
