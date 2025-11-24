import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail({}, { message: 'email must be an email' })
    email: string;
}

