import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    Query,
    UseGuards,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Properties')
@Controller('properties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nueva propiedad' })
    @ApiResponse({ status: 201, description: 'Propiedad creada exitosamente' })
    async create(@Body() createPropertyDto: CreatePropertyDto) {
        try {
            return await this.propertiesService.create(createPropertyDto);
        } catch (error) {
            throw new HttpException('Error creating property', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las propiedades con filtros' })
    @ApiQuery({ name: 'region', required: false })
    @ApiQuery({ name: 'province', required: false })
    @ApiQuery({ name: 'type', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'compatibleWith', required: false })
    @ApiQuery({ name: 'bankId', required: false })
    @ApiQuery({ name: 'minPrice', required: false })
    @ApiQuery({ name: 'maxPrice', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiResponse({ status: 200, description: 'Lista de propiedades' })
    findAll(@Query() filters: any) {
        return this.propertiesService.findAll(filters);
    }

    @Get('compatible')
    @ApiOperation({ summary: 'Obtener propiedades compatibles con elegibilidad del cliente' })
    @ApiQuery({ name: 'eligibility', required: true, type: [String] })
    @ApiResponse({ status: 200, description: 'Propiedades compatibles' })
    getCompatible(@Query('eligibility') eligibility: string[]) {
        return this.propertiesService.getCompatibleProperties(eligibility);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener propiedad por ID' })
    @ApiResponse({ status: 200, description: 'Propiedad encontrada' })
    @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
    async findOne(@Param('id') id: string) {
        try {
            return await this.propertiesService.findOne(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar propiedad' })
    @ApiResponse({ status: 200, description: 'Propiedad actualizada' })
    async update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
        try {
            return await this.propertiesService.update(id, updatePropertyDto);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar propiedad' })
    @ApiResponse({ status: 200, description: 'Propiedad eliminada' })
    remove(@Param('id') id: string) {
        return this.propertiesService.remove(id);
    }
}