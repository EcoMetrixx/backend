import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, comparePassword } from '../../common/utils/hashing.util';
import { RedisService } from '../../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../../shared/mailer/mailer.service';
import { randomBytes } from 'crypto';

const REFRESH_TOKEN_PREFIX = 'refresh_token:'; // + userId

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private redis: RedisService,
    private cfg: ConfigService,
    private mailer: MailerService,
  ) { }

  async register(data: {
    name: string;
    email: string;
    password: string;
    dni: string;
    phone: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new BadRequestException('Email already registered');

    const hashed = await hashPassword(data.password);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
        dni: data.dni,
        phone: data.phone,
      },
    });

    // optionally send welcome mail
    try {
      await this.mailer.sendWelcome(user.email, { name: user.name });
    } catch (e) {
      // log but do not fail registration
      console.warn('welcome email failed', e);
    }

    return { id: user.id, email: user.email, name: user.name, dni: user.dni, phone: user.phone };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const ok = await comparePassword(password, user.password);
    if (!ok) return null;
    return user;
  }

  async login(user: { id: string; email: string; name?: string }) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwt.sign(payload);

    // refresh token: create random token, store hashed in redis with TTL
    const refreshTokenRaw = randomBytes(64).toString('hex');
    const refreshSecret =
      this.cfg.get<string>('JWT_REFRESH_SECRET') ?? 'rsecret';
    const refreshExpires =
      this.cfg.get<string>('JWT_REFRESH_EXPIRATION') ?? '7d';

    // Optionally sign a refresh JWT (we store raw token hashed for rotation)
    const refreshKey = `${REFRESH_TOKEN_PREFIX}${user.id}`;
    const hashed = await hashPassword(refreshTokenRaw);
    // store hashed token in redis (single active token per user). TTL in seconds:
    const ttlSeconds = this.parseDurationToSeconds(refreshExpires);
    await this.redis.set(refreshKey, hashed, ttlSeconds);

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: this.parseDurationToSeconds(
        this.cfg.get<string>('JWT_ACCESS_EXPIRATION') ?? '15m',
      ),
    };
  }

  private parseDurationToSeconds(str: string) {
    // suport '15m', '7d', '3600s' or numeric seconds
    if (!str) return 0;
    if (/^\d+$/.test(str)) return Number(str);
    const m = str.match(/^(\d+)([smhd])$/);
    if (!m) return 0;
    const val = Number(m[1]);
    const unit = m[2];
    switch (unit) {
      case 's':
        return val;
      case 'm':
        return val * 60;
      case 'h':
        return val * 3600;
      case 'd':
        return val * 86400;
      default:
        return 0;
    }
  }

  async refreshTokens(userId: string, providedRefreshToken: string) {
    const key = `${REFRESH_TOKEN_PREFIX}${userId}`;
    const stored = await this.redis.get<string>(key);
    if (!stored) throw new UnauthorizedException('Refresh token not found');

    const isValid = await comparePassword(providedRefreshToken, stored);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    // rotate: issue new refresh token and replace stored hash
    const newRefreshRaw = randomBytes(64).toString('hex');
    const newHashed = await hashPassword(newRefreshRaw);
    const ttlSeconds = this.parseDurationToSeconds(
      this.cfg.get<string>('JWT_REFRESH_EXPIRATION') ?? '7d',
    );
    await this.redis.set(key, newHashed, ttlSeconds);

    const payload = { sub: userId };
    const accessToken = this.jwt.sign(payload);

    return { accessToken, refreshToken: newRefreshRaw };
  }

  async logout(userId: string) {
    const key = `${REFRESH_TOKEN_PREFIX}${userId}`;
    await this.redis.delete(key);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; // do not leak user presence

    const token = randomBytes(32).toString('hex');
    const key = `pwd_reset:${token}`;
    // store payload: userId and expire time
    await this.redis.set(key, JSON.stringify({ userId: user.id }), 60 * 30); // 30 minutes
    const resetUrl = `${this.cfg.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;
    await this.mailer.sendPasswordReset(email, { resetUrl, name: user.name });
  }

  async resetPassword(token: string, newPassword: string) {
    const key = `pwd_reset:${token}`;
    const payload = await this.redis.get<{ userId: string }>(key);
    if (!payload) throw new BadRequestException('Invalid or expired token');

    const userId = payload.userId;
    const hashed = await hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    await this.redis.delete(key);
    // optionally revoke refresh tokens:
    await this.logout(userId);
    return true;
  }
}
