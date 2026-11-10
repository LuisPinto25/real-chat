import { RegisterDto } from '../../dtos/auth.dto';

export class RegisterCommand {
  constructor(public readonly dto: RegisterDto) {}
}
