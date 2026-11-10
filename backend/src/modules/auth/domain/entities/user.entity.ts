export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly password?: string,
    public readonly avatar?: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static fromPrisma(prismaUser: {
    id: string;
    name: string;
    email: string;
    password?: string;
    avatar?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): UserEntity {
    return new UserEntity(
      prismaUser.id,
      prismaUser.name,
      prismaUser.email,
      prismaUser.password,
      prismaUser.avatar,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
