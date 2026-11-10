export interface Sender {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
}

export class MessageEntity {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly chatId: string,
    public readonly senderId: string,
    public readonly sender?: Sender,
    public readonly createdAt?: Date,
  ) {}
}
