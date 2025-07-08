import { Controller, Get, Post, Query, Res, Body } from '@nestjs/common';
import { Response } from 'express';
import { WhatsAppWebhookPayload } from './whatsapp-webhook.dto'; // o el path correcto

@Controller('webhook')
export class WebhookController {
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const MY_VERIFY_TOKEN = 'mi_token_secreto_123';

    if (mode && verifyToken) {
      if (mode === 'subscribe' && verifyToken === MY_VERIFY_TOKEN) {
        console.log('Webhook verificado');
        return res.status(200).send(challenge);
      } else {
        return res.sendStatus(403);
      }
    }
    return res.sendStatus(400);
  }

  @Post()
  receiveMessage(@Body() body: WhatsAppWebhookPayload, @Res() res: Response) {
    try {
      console.log('Webhook payload:', JSON.stringify(body, null, 2));

      const changes = body.entry?.[0]?.changes?.[0];
      const messages = changes?.value?.messages;

      if (messages && messages.length > 0) {
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
