import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConversationsService } from './conversations.service';

@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get('conversations')
  async getConversations(@Res() res: Response) {
    try {
      const conversations = await this.conversationsService.getRecentConversations();
      return res.status(200).json(conversations);
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);
      return res.sendStatus(500);
    }
  }
}
