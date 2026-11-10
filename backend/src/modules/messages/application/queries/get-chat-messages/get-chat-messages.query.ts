export class GetChatMessagesQuery {
  constructor(
    public readonly chatId: string,
    public readonly userId: string,
    public readonly limit?: number,
  ) {}
}
