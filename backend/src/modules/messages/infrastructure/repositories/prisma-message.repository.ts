import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IMessageRepository } from '../../domain/repositories/message.repository.interface';
import { MessageEntity } from '../../domain/entities/message.entity';

@Injectable()
export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapPrismaMessageToEntity(msg: any): MessageEntity {
    return new MessageEntity(
      msg.id,
      msg.content,
      msg.chatId,
      msg.senderId,
      msg.sender
        ? {
            id: msg.sender.id,
            name: msg.sender.name,
            email: msg.sender.email,
            avatar: msg.sender.avatar,
          }
        : undefined,
      msg.createdAt,
    );
  }

  async create(data: {
    content: string;
    chatId: string;
    senderId: string;
  }): Promise<MessageEntity> {
    const [createdMessage] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          content: data.content,
          chatId: data.chatId,
          senderId: data.senderId,
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      }),

      this.prisma.chat.update({
        where: { id: data.chatId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return this.mapPrismaMessageToEntity(createdMessage);
  }

  async findByChatId(chatId: string, limit = 100): Promise<MessageEntity[]> {
    const messages = await this.prisma.message.findMany({
      where: { chatId },
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return messages.map((message) => this.mapPrismaMessageToEntity(message));
  }
}
