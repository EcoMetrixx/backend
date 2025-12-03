import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre completo del asesor de ventas',
    example: 'Juan Pérez'
  })
  @IsNotEmpty() name: string;

  @ApiProperty({
    description: 'Correo electrónico único',
    example: 'juan.perez@email.com'
  })
  @IsEmail() email: string;

  @ApiProperty({
    description: 'DNI del asesor',
    example: '12345678'
  })
  @IsNotEmpty() dni: string;

  @ApiProperty({
    description: 'Número de teléfono',
    example: '+51987654321'
  })
  @IsNotEmpty() phone: string;

  @ApiProperty({
    description: 'Contraseña (mínimo 8 caracteres)',
    example: 'password123',
    minLength: 8
  })
  @IsNotEmpty() @MinLength(8) password: string;
}