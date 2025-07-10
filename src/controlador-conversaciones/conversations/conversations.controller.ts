import { Controller, Get, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async getConversations(@Res() res: Response) {
    try {
      const conversations = await this.conversationsService.getRecentConversations();
      return res.status(200).json(conversations);
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);
      return res.sendStatus(500);
    }
  }

  @Get('/messages')
  async getConversationById(
    @Query('conversationId') conversationId: string,
    @Res() res: Response,
  ) {

    if (!conversationId) {
      return res.status(400).json({error: 'Falta el parámetro de conversationId'});
    }

    const id = Number(conversationId);
    if(isNaN(id)) {
      return res.status(400).json({ error: 'El parámetro conversationId debe ser un número.'});
    }

    try {
      const message = await this.conversationsService.getMessageById(Number(conversationId));
      if(!message.rows || message.rows.length === 0) {
        return res.status(404).json({ message: 'No se encontraron mensajes para esa conversación.'});
      }

      return res.status(200).json(message.rows);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}
