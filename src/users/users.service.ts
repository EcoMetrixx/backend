import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async create(userData: {
        email: string;
        password: string;
        name: string;
        role: string;
    }): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.usersRepository.create({
            ...userData,
            password: hashedPassword,
        });
        return this.usersRepository.save(user);
    }

    async updatePasswordResetToken(
        email: string,
        token: string,
        expiresAt: Date,
    ): Promise<void> {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = expiresAt;
        await this.usersRepository.save(user);
    }

    async findByPasswordResetToken(token: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: {
                passwordResetToken: token,
            },
        });
    }

    async updatePassword(userId: string, newPassword: string): Promise<void> {
        const user = await this.findById(userId);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await this.usersRepository.save(user);
    }

    async validatePassword(
        plainPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

