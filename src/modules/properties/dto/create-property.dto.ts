// src/modules/properties/dto/create-property.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({ description: 'Nombre de la propiedad' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Precio de la propiedad' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Ubicación específica' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Región' })
  @IsString()
  region: string;

  @ApiProperty({ description: 'Provincia' })
  @IsString()
  province: string;

  @ApiProperty({ description: 'Tipo de propiedad' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Descripción detallada', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'URLs de imágenes',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    description: 'Estado de la propiedad',
    required: false,
    enum: ['disponible', 'vendido', 'reservado'],
  })
  @IsOptional()
  @IsIn(['disponible', 'vendido', 'reservado'])
  status?: string;

  @ApiProperty({
    description: 'Compatible con bono',
    required: false,
    enum: ['MiVivienda', 'Techo Propio', 'Ambos'],
  })
  @IsOptional()
  @IsIn(['MiVivienda', 'Techo Propio', 'Ambos'])
  compatibleWith?: string;

  @ApiProperty({ description: 'ID del banco que financia', required: false })
  @IsOptional()
  @IsString()
  bankId?: string;
}
