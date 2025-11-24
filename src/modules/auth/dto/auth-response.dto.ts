import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({
        description: 'Token de acceso JWT',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    accessToken: string;

    @ApiProperty({
        description: 'Token de refresh',
        example: 'random-refresh-token-string'
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Tiempo de expiración en segundos',
        example: 900
    })
    expiresIn: number;
}

export class UserResponseDto {
    @ApiProperty({
        description: 'ID único del usuario',
        example: 'uuid-string'
    })
    id: string;

    @ApiProperty({
        description: 'Correo electrónico',
        example: 'juan.perez@email.com'
    })
    email: string;

    @ApiProperty({
        description: 'Nombre completo',
        example: 'Juan Pérez'
    })
    name?: string;

    @ApiProperty({
        description: 'DNI',
        example: '12345678'
    })
    dni?: string;

    @ApiProperty({
        description: 'Teléfono',
        example: '+51987654321'
    })
    phone?: string;
}