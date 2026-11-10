import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  LastMessage,
  ParticipantUser,
} from '../../domain/entities/chat.entity';

export class CreateChatDto {
  @IsArray({ message: 'participantIds debe ser un arreglo de IDs de usuarios' })
  @ArrayNotEmpty({
    message: 'Debe incluir al menos un usuario para iniciar un chat',
  })
  @IsString({
    each: true,
    message: 'Cada ID de usuario debe ser una cadena de texto',
  })
  participantIds: string[];

  @IsOptional()
  @IsString({ message: 'El nombre del chat debe ser una cadena de texto' })
  name?: string;

  @IsOptional()
  @IsBoolean({ message: 'isGroup debe ser un valor booleano' })
  isGroup?: boolean;
}

export class ChatResponseDto {
  id: string;
  name: string | null;
  isGroup: boolean;

  participants: {
    id: string;
    userId: string;
    user?: ParticipantUser;
    joinedAt?: Date;
  }[];

  lastMessage?: LastMessage | null;

  createdAt?: Date;
  updatedAt?: Date;
}
