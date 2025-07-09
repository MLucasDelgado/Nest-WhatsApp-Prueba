import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConversationsService } from 'src/controlador-conversaciones/conversations/conversations.service';
import { WhatsAppWebhookPayload } from './whatsapp-webhook.dto';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async receiveMessage(
    @Body() body: WhatsAppWebhookPayload,
    @Res() res: Response,
  ) {
    try {
      console.log('Webhook payload:', JSON.stringify(body, null, 2));

      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      const messages = value?.messages;
      const contacts = value?.contacts;

      if (messages?.length && contacts?.length) {
        const message = messages[0];
        const contact = contacts[0];

        const from = message.from;
        const msgBody = message.text?.body || '';
        const timestamp = Number(message.timestamp) * 1000; // timestamp en milisegundos
        const name = contact.profile?.name || null;

        console.log(`Mensaje de ${from}: ${msgBody}`);

        // 👇 Guardar en la base de datos
        const conversationId = await this.conversationsService.upsertConversation(
          from,
          name,
          msgBody,
          new Date(timestamp),
        );

        await this.conversationsService.insertMessage(
          conversationId,
          from,
          msgBody,
          new Date(timestamp),
        );
      }

      return res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      return res.sendStatus(500);
    }
  }
}
