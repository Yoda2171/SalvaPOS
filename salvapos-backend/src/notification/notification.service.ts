import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `${process.env.URL_FRONTEND}/resetpassword/${resetToken}`; // Cambia por tu URL de frontend

    await this.mailerService.sendMail({
      to: email, // Correo del destinatario
      subject: 'Restablecer contraseña',
      template: './reset-password', // Nombre del archivo de la plantilla
      context: {
        // Variables para la plantilla
        resetUrl,
      },
    });
  }
}
