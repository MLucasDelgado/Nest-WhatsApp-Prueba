import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send')
  async sendMessage(@Body('to') to: string): Promise<{ message: string; data: any }> {
    if (!to) {
      throw new HttpException(
        'Número destino (to) es requerido',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.whatsappService.sendMessage(to);
      return {
        message: 'Mensaje enviado correctamente',
        data: result,
      };
    } catch (error: unknown) {
      // Opcional: podrías loguear el error si querés
      throw new HttpException(
        'Error al enviar mensaje',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
