import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail({}, { message: 'email must be an email' })
    @IsNotEmpty({ message: 'email should not be empty' })
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsNotEmpty({ message: 'password should not be empty' })
    @MinLength(6, { message: 'password must be at least 6 characters' })
    password: string;
}

