import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllUsersQuery } from './get-all-users.query';
import { UserResponseDto } from '../../dtos/user-response.dto';
import {
  IUserRepository,
  USER_REPOSITORY_TOKEN,
} from '../../../domain/repositories/user.repository.interface';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<
  GetAllUsersQuery,
  UserResponseDto[]
> {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetAllUsersQuery): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAllExcept(query.currentUserId);
    return users.map((u) => u.toJSON());
  }
}
