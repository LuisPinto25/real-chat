import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  SendMessageDto,
  MessageResponseDto,
} from '../../application/dtos/message.dto';
import { SendMessageCommand } from '../../application/commands/send-message/send-message.command';
import { GetChatMessagesQuery } from '../../application/queries/get-chat-messages/get-chat-messages.query';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chats/:chatId/messages')
export class MessagesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getMessages(
    @Request() req: any,
    @Param('chatId') chatId: string,
    @Query('limit') limit?: number,
  ): Promise<MessageResponseDto[]> {
    return this.queryBus.execute(
      new GetChatMessagesQuery(
        chatId,
        req.user.id,
        limit ? Number(limit) : 100,
      ),
    );
  }

  @Post()
  async send(
    @Request() req: any,
    @Param('chatId') chatId: string,
    @Body() dto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    return this.commandBus.execute(
      new SendMessageCommand(req.user.id, chatId, dto.content),
    );
  }
}
