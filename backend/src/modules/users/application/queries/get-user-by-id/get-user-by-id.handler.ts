import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { UserResponseDto } from '../../dtos/user-response.dto';
import {
  IUserRepository,
  USER_REPOSITORY_TOKEN,
} from '../../../domain/repositories/user.repository.interface';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery, UserResponseDto> {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(query.id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user.toJSON();
  }
}
