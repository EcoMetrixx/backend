import { IsNotEmpty, IsOptional, IsNumber, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankDto {
    @ApiProperty({ description: 'Nombre del banco' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Tasa de interés base (%)' })
    @IsNotEmpty()
    @IsNumber()
    interestRate: number;

    @ApiPropertyOptional({ description: 'Descripción del banco' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'TEA - Tasa Efectiva Anual (%)' })
    @IsOptional()
    @IsNumber()
    tea?: number;

    @ApiPropertyOptional({ description: 'TEM - Tasa Efectiva Mensual (%)' })
    @IsOptional()
    @IsNumber()
    tem?: number;

    @ApiPropertyOptional({ description: 'Gastos administrativos (%)' })
    @IsOptional()
    @IsNumber()
    adminFees?: number;

    @ApiPropertyOptional({ description: 'Periodo de gracia (meses)' })
    @IsOptional()
    @IsNumber()
    gracePeriod?: number;

    @ApiPropertyOptional({ description: 'Comisión de evaluación' })
    @IsOptional()
    @IsNumber()
    evaluationFee?: number;

    @ApiPropertyOptional({ description: 'Seguro de desgravamen (%)' })
    @IsOptional()
    @IsNumber()
    lifeInsurance?: number;

    @ApiPropertyOptional({ description: 'Plazos disponibles (meses)', type: [Number] })
    @IsOptional()
    @IsArray()
    availableTerms?: number[];

    @ApiPropertyOptional({ description: 'Máximo financiamiento (%)' })
    @IsOptional()
    @IsNumber()
    maxFinancing?: number;
}