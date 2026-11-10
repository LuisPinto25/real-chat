import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface';
import {
  ChatEntity,
  ChatParticipantEntity,
  LastMessage,
} from '../../domain/entities/chat.entity';

@Injectable()
export class PrismaChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapPrismaChatToEntity(chat: any): ChatEntity {
    const participants: ChatParticipantEntity[] = chat.participants.map(
      (participant: any) => {
        const { id, chatId, userId, user, joinedAt } = participant;

        return new ChatParticipantEntity(
          id,
          chatId,
          userId,
          {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
          joinedAt,
        );
      },
    );

    const [firstMsg] = chat.messages ?? [];
    let lastMsg: LastMessage | null = null;

    if (firstMsg) {
      const { id, content, createdAt, senderId, sender } = firstMsg;
      lastMsg = {
        id,
        content,
        createdAt,
        senderId,
        senderName: sender?.name,
      };
    }

    return new ChatEntity(
      chat.id,
      chat.name,
      chat.isGroup,
      participants,
      lastMsg,
      chat.createdAt,
      chat.updatedAt,
    );
  }

  async findUserChats(userId: string): Promise<ChatEntity[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },

      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },

        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { name: true },
            },
          },
        },
      },

      orderBy: { updatedAt: 'desc' },
    });

    return chats.map((chat) => this.mapPrismaChatToEntity(chat));
  }

  async findById(id: string): Promise<ChatEntity | null> {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },

        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { name: true },
            },
          },
        },
      },
    });

    return chat ? this.mapPrismaChatToEntity(chat) : null;
  }

  async findDirectChat(
    userId1: string,
    userId2: string,
  ): Promise<ChatEntity | null> {
    const chats = await this.prisma.chat.findMany({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } },
        ],
      },

      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },

        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { name: true },
            },
          },
        },
      },
    });

    const directChat = chats.find((c) => c.participants.length === 2);
    return directChat ? this.mapPrismaChatToEntity(directChat) : null;
  }

  async create(data: {
    name?: string;
    isGroup: boolean;
    participantIds: string[];
  }): Promise<ChatEntity> {
    const created = await this.prisma.chat.create({
      data: {
        name: data.name,
        isGroup: data.isGroup,
        participants: {
          create: data.participantIds.map((userId) => ({
            userId,
          })),
        },
      },

      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },

        messages: {
          take: 1,
        },
      },
    });

    return this.mapPrismaChatToEntity(created);
  }

  async isParticipant(chatId: string, userId: string): Promise<boolean> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: { chatId, userId },
      },
    });
    return !!participant;
  }

  async getParticipantIds(chatId: string): Promise<string[]> {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { chatId },
      select: { userId: true },
    });
    return participants.map((p) => p.userId);
  }
}
