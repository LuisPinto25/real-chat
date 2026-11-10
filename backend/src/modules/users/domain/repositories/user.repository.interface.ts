import { UserEntity } from '../../../auth/domain/entities/user.entity';

export abstract class IUserRepository {
  abstract findAllExcept(excludedUserId: string): Promise<UserEntity[]>;
  abstract findById(id: string): Promise<UserEntity | null>;
}

export const USER_REPOSITORY_TOKEN = 'IUserRepository';
