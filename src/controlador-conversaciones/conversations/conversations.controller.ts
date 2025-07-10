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

    const message = await this.conversationsService.getMessageById(Number(conversationId));
    return res.status(200).json(message.rows);
  }
}
