import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
    private transporter: nodemailer.Transporter | null = null;

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        // Configurar transporter de email solo si está configurado
        const smtpHost = this.configService.get<string>('SMTP_HOST');
        const smtpUser = this.configService.get<string>('SMTP_USER');
        const smtpPass = this.configService.get<string>('SMTP_PASS');

        if (smtpHost && smtpUser && smtpPass) {
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: this.configService.get<number>('SMTP_PORT') || 587,
                secure: false,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });
        }
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        const isPasswordValid = await this.usersService.validatePassword(
            loginDto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        const payload = { email: user.email, sub: user.id };
        const access_token = this.jwtService.sign(payload);

        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async refresh(userId: string) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException();
        }

        const payload = { email: user.email, sub: user.id };
        const access_token = this.jwtService.sign(payload);

        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async logout() {
        // En una implementación más completa, podrías invalidar el token en una blacklist
        // Por ahora, simplemente retornamos éxito ya que JWT es stateless
        return {};
    }

    async requestPasswordReset(email: string) {
        const user = await this.usersService.findByEmail(email);

        // Por seguridad, siempre retornamos éxito aunque el email no exista
        if (!user) {
            return {
                message: 'Se ha enviado un enlace de recuperación a tu correo electrónico',
            };
        }

        // Generar token único
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Expira en 1 hora

        await this.usersService.updatePasswordResetToken(
            email,
            resetToken,
            expiresAt,
        );

        // Enviar email con el token
        const resetUrl = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/reset-password?token=${resetToken}`;

        if (this.transporter) {
            try {
                await this.transporter.sendMail({
                    from: this.configService.get<string>('SMTP_USER'),
                    to: email,
                    subject: 'Recuperación de contraseña',
                    html: `
            <h2>Recuperación de contraseña</h2>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, ignora este email.</p>
          `,
                });
            } catch (error) {
                // Si falla el envío, loguear el token en consola para desarrollo
                console.error('Error al enviar email:', error);
                console.log('Password reset token (dev):', resetToken);
                console.log('Reset URL:', resetUrl);
            }
        } else {
            // Si no hay configuración de SMTP, loguear el token en consola para desarrollo
            console.log('⚠️  SMTP no configurado. Token de recuperación (solo para desarrollo):');
            console.log('Token:', resetToken);
            console.log('Reset URL:', resetUrl);
        }

        return {
            message: 'Se ha enviado un enlace de recuperación a tu correo electrónico',
        };
    }

    async confirmPasswordReset(
        passwordResetConfirmDto: PasswordResetConfirmDto,
    ) {
        const user = await this.usersService.findByPasswordResetToken(
            passwordResetConfirmDto.token,
        );

        if (!user) {
            throw new BadRequestException(
                'Token de recuperación inválido o expirado',
            );
        }

        // Verificar que el token no haya expirado
        if (
            !user.passwordResetExpires ||
            user.passwordResetExpires < new Date()
        ) {
            throw new BadRequestException(
                'Token de recuperación inválido o expirado',
            );
        }

        // Actualizar contraseña
        await this.usersService.updatePassword(
            user.id,
            passwordResetConfirmDto.newPassword,
        );

        return {
            message: 'Contraseña restablecida exitosamente',
        };
    }
}

