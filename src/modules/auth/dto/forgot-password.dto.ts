import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Correo electrónico para recuperación',
    example: 'juan.perez@email.com'
  })
  @IsEmail() email: string;
}