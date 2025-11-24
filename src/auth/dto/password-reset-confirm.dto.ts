import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetConfirmDto {
    @ApiProperty({ example: 'reset-token-123' })
    @IsNotEmpty({ message: 'token should not be empty' })
    token: string;

    @ApiProperty({ example: 'newPassword123', minLength: 6 })
    @IsNotEmpty({ message: 'newPassword should not be empty' })
    @MinLength(6, { message: 'newPassword must be at least 6 characters' })
    newPassword: string;
}

