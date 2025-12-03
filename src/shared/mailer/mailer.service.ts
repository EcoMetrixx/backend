import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST') || 'smtp.gmail.com',
      port: this.config.get('SMTP_PORT') || 587,
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async sendWelcome(email: string, data: { name: string }) {
    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM') || 'noreply@ecometrix.com',
      to: email,
      subject: 'Bienvenido a EcoMetrix',
      html: `
        <h1>Bienvenido ${data.name}!</h1>
        <p>Tu cuenta ha sido creada exitosamente.</p>
      `,
    });
  }

  async sendPasswordReset(
    email: string,
    data: { resetUrl: string; name: string },
  ) {
    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM') || 'noreply@ecometrix.com',
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <h1>Recuperación de contraseña</h1>
        <p>Hola ${data.name},</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${data.resetUrl}">Restablecer contraseña</a>
        <p>Este enlace expirará en 30 minutos.</p>
      `,
    });
  }
}
