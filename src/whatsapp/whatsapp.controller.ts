import { Controller, Get, Post, Query, Res, Body } from '@nestjs/common';
import { Response } from 'express';
import { WhatsAppWebhookPayload } from './whatsapp-webhook.dto';

@Controller('webhook')
export class WebhookController {
  private readonly VERIFY_TOKEN = 'mi_token_secreto_123';

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    if (mode && token) {
      if (mode === 'subscribe' && token === this.VERIFY_TOKEN) {
        console.log('Webhook verificado');
        return res.status(200).send(challenge);
      }
      return res.sendStatus(403);
    }
    return res.sendStatus(400);
  }

  @Post()
  receiveMessage(@Body() body: WhatsAppWebhookPayload, @Res() res: Response) {
    try {
      console.log('Webhook payload:', JSON.stringify(body, null, 2));

      const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
      if (messages?.length) {
        for (const message of messages) {
          const from = message.from;
          const msgBody = message.text?.body || '';
          console.log(`Mensaje de ${from}: ${msgBody}`);
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      return res.sendStatus(500);
    }
  }
}
