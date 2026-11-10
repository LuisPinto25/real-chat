export interface ParticipantUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface LastMessage {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  senderName?: string;
}

export class ChatParticipantEntity {
  constructor(
    public readonly id: string,
    public readonly chatId: string,
    public readonly userId: string,
    public readonly user?: ParticipantUser,
    public readonly joinedAt?: Date,
  ) {}
}

export class ChatEntity {
  constructor(
    public readonly id: string,
    public readonly name: string | null,
    public readonly isGroup: boolean,
    public readonly participants: ChatParticipantEntity[],
    public readonly lastMessage?: LastMessage | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
