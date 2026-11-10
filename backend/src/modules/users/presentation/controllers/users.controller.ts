import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetAllUsersQuery } from '../../application/queries/get-all-users/get-all-users.query';
import { GetUserByIdQuery } from '../../application/queries/get-user-by-id/get-user-by-id.query';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async getAll(@Request() req: any): Promise<UserResponseDto[]> {
    return this.queryBus.execute(new GetAllUsersQuery(req.user.id));
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }
}
