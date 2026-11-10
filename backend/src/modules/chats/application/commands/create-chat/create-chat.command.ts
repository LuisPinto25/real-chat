import { CreateChatDto } from '../../dtos/chat.dto';

export class CreateChatCommand {
  constructor(
    public readonly currentUserId: string,
    public readonly dto: CreateChatDto,
  ) {}
}
