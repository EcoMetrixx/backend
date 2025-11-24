import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyDto {
    @ApiProperty({ description: 'Nombre de la propiedad' })
    name: string;

    @ApiProperty({ description: 'Precio de la propiedad' })
    price: number;

    @ApiProperty({ description: 'Ubicación específica' })
    location: string;

    @ApiProperty({ description: 'Región' })
    region: string;

    @ApiProperty({ description: 'Provincia' })
    province: string;

    @ApiProperty({ description: 'Tipo de propiedad' })
    type: string;

    @ApiProperty({ description: 'Descripción detallada', required: false })
    description?: string;

    @ApiProperty({ description: 'URLs de imágenes', required: false, type: [String] })
    images?: string[];

    @ApiProperty({ description: 'Estado de la propiedad', required: false, enum: ['disponible', 'vendido', 'reservado'] })
    status?: string;

    @ApiProperty({ description: 'Compatible con bono', required: false, enum: ['Mi Vivienda', 'Techo Propio', 'Ambos'] })
    compatibleWith?: string;

    @ApiProperty({ description: 'ID del banco que financia', required: false })
    bankId?: string;
}