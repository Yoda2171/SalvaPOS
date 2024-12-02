import { Injectable } from '@nestjs/common';
import { WebpayPlus, Options, Environment } from 'transbank-sdk';

@Injectable()
export class TransbankService {
  private readonly webpay;

  constructor() {
    // Configuración de Webpay Plus
    this.webpay = new WebpayPlus.Transaction(
      new Options(
        '597055555532', // Código de comercio para integración
        '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C', // Clave API de integración
        Environment.Integration, // Ambiente de integración
      ),
    );
  }

  // Método para iniciar una transacción
  async iniciarTransaccion(
    amount: number,
    sessionId: string,
    buyOrder: string,
    returnUrl: string,
  ) {
    try {
      console.log('Datos enviados a Transbank:', {
        amount,
        sessionId,
        buyOrder,
        returnUrl,
      });

      // Llamada al SDK de Transbank
      const response = await this.webpay.create(
        buyOrder,
        sessionId,
        amount,
        returnUrl,
      );

      console.log('Respuesta de Transbank:', response);
      return response;
    } catch (error) {
      console.error('Error en iniciarTransaccion:', error);
      throw error;
    }
  }

  // Método para confirmar una transacción
  async confirmarTransaccion(token: string) {
    try {
      console.log('Token recibido para confirmar:', token);

      // Llamada al SDK de Transbank para confirmar la transacción
      const response = await this.webpay.commit(token);

      console.log('Respuesta de confirmación:', response);
      return response;
    } catch (error) {
      console.error('Error en confirmarTransaccion:', error);
      throw error;
    }
  }
}
