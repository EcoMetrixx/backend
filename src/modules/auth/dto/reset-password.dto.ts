import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de recuperación recibido por email',
    example: 'abc123def456'
  })
  @IsNotEmpty() token: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 8 caracteres)',
    example: 'newpassword123',
    minLength: 8
  })
  @IsNotEmpty() @MinLength(8) newPassword: string;
}