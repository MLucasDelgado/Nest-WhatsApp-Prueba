import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('webhook')
export class WebhookController {
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const MY_VERIFY_TOKEN = 'mi_token_secreto_123'; // debe coincidir con Facebook

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
}
