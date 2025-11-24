import { IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsNumber, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
    @ApiProperty({ description: 'Nombre del cliente' })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({ description: 'Apellido del cliente' })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({ description: 'DNI único del cliente' })
    @IsNotEmpty()
    @IsString()
    dni: string;

    @ApiProperty({ description: 'Fecha de nacimiento', example: '1990-01-01T00:00:00.000Z' })
    @IsNotEmpty()
    birthDate: Date;

    @ApiProperty({ description: 'Estado civil', example: 'Soltero' })
    @IsNotEmpty()
    @IsString()
    civilStatus: string;

    @ApiPropertyOptional({ description: 'Correo electrónico' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'Número de teléfono' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ description: 'Dirección' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ description: 'Región' })
    @IsOptional()
    @IsString()
    region?: string;

    @ApiPropertyOptional({ description: 'Provincia' })
    @IsOptional()
    @IsString()
    province?: string;

    @ApiProperty({ description: 'Tipo de empleo', enum: ['Empleado', 'Desempleado'] })
    @IsNotEmpty()
    @IsString()
    employmentType: string;

    @ApiPropertyOptional({ description: 'Ocupación/empresa' })
    @IsOptional()
    @IsString()
    occupation?: string;

    @ApiPropertyOptional({ description: 'Antigüedad laboral en meses' })
    @IsOptional()
    @IsNumber()
    jobSeniority?: number;

    @ApiProperty({ description: 'Carga familiar (0-4+)' })
    @IsNotEmpty()
    @IsNumber()
    familyLoad: number;

    @ApiProperty({ description: 'Ingreso familiar mensual' })
    @IsNotEmpty()
    @IsNumber()
    familyIncome: number;

    @ApiProperty({ description: 'Ahorros disponibles' })
    @IsNotEmpty()
    @IsNumber()
    savings: number;

    @ApiProperty({ description: 'Deudas existentes' })
    @IsNotEmpty()
    @IsNumber()
    debts: number;

    @ApiProperty({ description: '¿Es primera vivienda?' })
    @IsNotEmpty()
    @IsBoolean()
    firstHome: boolean;

    @ApiPropertyOptional({ description: 'Observaciones adicionales' })
    @IsOptional()
    @IsString()
    notes?: string;
}