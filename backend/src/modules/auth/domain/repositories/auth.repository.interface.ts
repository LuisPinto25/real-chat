import { UserEntity } from '../entities/user.entity';

export abstract class IAuthRepository {
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract create(userData: {
    name: string;
    email: string;
    password: string;
    avatar?: string;
  }): Promise<UserEntity>;
}

export const AUTH_REPOSITORY_TOKEN = 'IAuthRepository';
