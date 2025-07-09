import { Controller, Get, Post, Query, Res, Body } from '@nestjs/common';
import { Response } from 'express';
import { ConversationsService } from 'src/controlador-conversaciones/conversations/conversations.service';

@Controller('webhook')
export class WebhookController {
  private readonly VERIFY_TOKEN = 'mi_token_secreto_123';

  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    if (mode && token) {
      if (mode === 'subscribe' && token === this.VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      }
      return res.sendStatus(403);
    }
    return res.sendStatus(400);
  }

  @Post()
  async receiveMessage(@Body() body: any, @Res() res: Response) {
    try {
      const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
      if (messages?.length) {
        for (const message of messages) {
          const from = message.from;
          const msgBody = message.text?.body || '';
          const timestamp = new Date(Number(body.entry[0].changes[0].value.timestamp) * 1000);
          const name = body.entry[0].changes[0].value.contacts?.[0]?.profile?.name || null;

          const conversationId = await this.conversationsService.upsertConversation(from, name, msgBody, timestamp);
          await this.conversationsService.insertMessage(conversationId, from, msgBody, timestamp);

          console.log(`Mensaje de ${from}: ${msgBody}`);
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('Error procesando webhook:', error);
      return res.sendStatus(500);
    }
  }
}