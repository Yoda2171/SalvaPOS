import { Controller, Post, Body } from '@nestjs/common';
import { TransbankService } from './transbank.service';

@Controller('transbank')
export class TransbankController {
  constructor(private readonly transbankService: TransbankService) {}

  // Endpoint para iniciar una transacción
  @Post('iniciar')
  async iniciarPago(
    @Body()
    body: {
      amount: number;
      sessionId: string;
      buyOrder: string;
      returnUrl: string;
    },
  ) {
    try {
      console.log('Cuerpo recibido en iniciarPago:', body);

      const response = await this.transbankService.iniciarTransaccion(
        body.amount,
        body.sessionId,
        body.buyOrder,
        body.returnUrl,
      );

      return {
        url: response.url, // URL de redirección
        token: response.token, // Token de la transacción
      };
    } catch (error) {
      console.error('Error en iniciarPago:', error);
      throw error;
    }
  }

  // Endpoint para confirmar una transacción
  @Post('confirmar')
  async confirmarPago(@Body() body: { token: string }) {
    try {
      console.log('Cuerpo recibido en confirmarPago:', body);

      const response = await this.transbankService.confirmarTransaccion(
        body.token,
      );

      return response; // Devuelve los detalles de la transacción confirmada
    } catch (error) {
      console.error('Error en confirmarPago:', error);
      throw error;
    }
  }
}
