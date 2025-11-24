import { IsNotEmpty, IsOptional, IsUUID, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSimulationDto {
    @ApiProperty({ description: 'ID del cliente' })
    @IsNotEmpty()
    @IsUUID()
    clientId: string;

    @ApiPropertyOptional({ description: 'ID de la propiedad' })
    @IsOptional()
    @IsUUID()
    propertyId?: string;

    @ApiPropertyOptional({ description: 'ID del banco' })
    @IsOptional()
    @IsUUID()
    bankId?: string;

    @ApiProperty({ description: 'Programa de financiamiento' })
    @IsNotEmpty()
    @IsString()
    program: string;

    @ApiProperty({ description: 'Monto del préstamo' })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ description: 'Pago mensual calculado' })
    @IsNotEmpty()
    @IsNumber()
    monthlyPayment: number;

    @ApiProperty({ description: 'Plazo en años' })
    @IsNotEmpty()
    @IsNumber()
    term: number;

    @ApiProperty({
        description: 'Resultado del cálculo',
        type: 'object',
        additionalProperties: true
    })
    @IsNotEmpty()
    result: any;
}