import { Module } from '@nestjs/common';
import { WebhookController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  controllers: [WebhookController],
  providers: [WhatsappService],
})
export class WhatsappModule {}
