import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ description: 'Nombres del cliente' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Apellidos del cliente' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'DNI del cliente' })
  @IsString()
  dni: string;

  @ApiProperty({
    description: 'Fecha de nacimiento (ISO string)',
    example: '1992-05-18T00:00:00.000Z',
  })
  @IsString()
  birthDate: string; // 👈 ahora NO es opcional, se evita el error de TS

  @ApiProperty({
    description: 'Estado civil',
    required: false,
    example: 'Soltero',
  })
  @IsOptional()
  @IsString()
  civilStatus?: string;

  @ApiProperty({ description: 'Correo electrónico' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Teléfono', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Dirección', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Región (departamento)', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ description: 'Provincia', required: false })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ description: 'Tipo de empleo', required: false })
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiProperty({ description: 'Ocupación', required: false })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiProperty({ description: 'Antigüedad laboral (años)', required: false })
  @IsOptional()
  @IsNumber()
  jobSeniority?: number;

  @ApiProperty({ description: 'Carga familiar', required: false })
  @IsOptional()
  @IsNumber()
  familyLoad?: number;

  @ApiProperty({
    description: 'Ingreso familiar mensual',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  familyIncome?: number;

  @ApiProperty({ description: 'Ahorros disponibles', required: false })
  @IsOptional()
  @IsNumber()
  savings?: number;

  @ApiProperty({ description: 'Deudas', required: false })
  @IsOptional()
  @IsNumber()
  debts?: number;

  @ApiProperty({ description: '¿Primera vivienda?', required: false })
  @IsOptional()
  @IsBoolean()
  firstHome?: boolean;

  @ApiProperty({
    description: 'Bono asignado (MiVivienda / Techo Propio / Ninguno)',
    required: false,
  })
  @IsOptional()
  @IsString()
  bonus?: string;

  @ApiProperty({
    description: 'Estado del crédito (Apto / No apto / En proceso, etc.)',
    required: false,
  })
  @IsOptional()
  @IsString()
  creditStatus?: string;

  @ApiProperty({ description: 'Notas del asesor', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Banco seleccionado para el cliente',
    required: false,
  })
  @IsOptional()
  @IsString()
  bank?: string; // 👈 para persistir el banco seleccionado

  @ApiProperty({
    description: 'ID de la propiedad seleccionada',
    required: false,
  })
  @IsOptional()
  @IsString()
  propertyId?: string; // 👈 para persistir la vivienda seleccionada
}
