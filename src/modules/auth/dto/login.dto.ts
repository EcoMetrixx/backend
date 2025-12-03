import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Correo electrónico',
    example: 'juan.perez@email.com'
  })
  @IsEmail() email: string;

  @ApiProperty({
    description: 'Contraseña',
    example: 'password123'
  })
  @IsNotEmpty() password: string;
}