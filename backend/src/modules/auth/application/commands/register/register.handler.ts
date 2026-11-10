import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterCommand } from './register.command';
import { AuthResponseDto } from '../../dtos/auth.dto';
import {
  AUTH_REPOSITORY_TOKEN,
  IAuthRepository,
} from '../../../domain/repositories/auth.repository.interface';
import { PasswordHasherService } from '../../../infrastructure/services/password-hasher.service';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<
  RegisterCommand,
  AuthResponseDto
> {
  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RegisterCommand): Promise<AuthResponseDto> {
    const { name, email, password } = command.dto;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await this.authRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('El correo ya se encuentra registrado');
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    const user = await this.authRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
    });

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
