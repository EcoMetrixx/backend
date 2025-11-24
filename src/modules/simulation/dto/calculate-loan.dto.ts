import { IsNotEmpty, IsOptional, IsNumber, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateLoanDto {
    @ApiProperty({ description: 'Monto del préstamo' })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ description: 'Tasa de interés (%)' })
    @IsNotEmpty()
    @IsNumber()
    interestRate: number;

    @ApiProperty({ description: 'Plazo en años' })
    @IsNotEmpty()
    @IsNumber()
    term: number;

    @ApiPropertyOptional({ description: 'Periodo de gracia (meses)' })
    @IsOptional()
    @IsNumber()
    gracePeriod?: number;

    @ApiPropertyOptional({ description: 'Gastos administrativos (%)' })
    @IsOptional()
    @IsNumber()
    adminFees?: number;

    @ApiPropertyOptional({ description: 'Comisión de evaluación' })
    @IsOptional()
    @IsNumber()
    evaluationFee?: number;

    @ApiPropertyOptional({ description: 'Seguro de desgravamen (%)' })
    @IsOptional()
    @IsNumber()
    lifeInsurance?: number;

    @ApiPropertyOptional({ description: 'Moneda', enum: ['PEN', 'USD'] })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional({ description: 'Frecuencia de pagos', enum: ['monthly', 'quarterly'] })
    @IsOptional()
    @IsString()
    paymentFrequency?: string;
}