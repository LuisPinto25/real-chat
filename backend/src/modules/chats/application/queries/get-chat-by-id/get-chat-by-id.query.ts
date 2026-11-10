export class GetChatByIdQuery {
  constructor(
    public readonly chatId: string,
    public readonly userId: string,
  ) {}
}
