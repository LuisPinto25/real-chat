import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateChatDto, ChatResponseDto } from '../../application/dtos/chat.dto';
import { CreateChatCommand } from '../../application/commands/create-chat/create-chat.command';
import { GetUserChatsQuery } from '../../application/queries/get-user-chats/get-user-chats.query';
import { GetChatByIdQuery } from '../../application/queries/get-chat-by-id/get-chat-by-id.query';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateChatDto): Promise<ChatResponseDto> {
    return this.commandBus.execute(new CreateChatCommand(req.user.id, dto));
  }

  @Get()
  async getUserChats(@Request() req: any): Promise<ChatResponseDto[]> {
    return this.queryBus.execute(new GetUserChatsQuery(req.user.id));
  }

  @Get(':id')
  async getById(@Request() req: any, @Param('id') id: string): Promise<ChatResponseDto> {
    return this.queryBus.execute(new GetChatByIdQuery(id, req.user.id));
  }
}
