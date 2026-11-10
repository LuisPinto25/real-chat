import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Sender } from '../../domain/entities/message.entity';

export class SendMessageDto {
  @IsString({
    message: 'El contenido del mensaje debe ser una cadena de texto',
  })
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @MaxLength(5000, {
    message: 'El mensaje no puede exceder los 5000 caracteres',
  })
  content: string;
}

export class MessageResponseDto {
  id: string;
  content: string;
  chatId: string;
  senderId: string;
  sender?: Sender;
  createdAt?: Date;
}
