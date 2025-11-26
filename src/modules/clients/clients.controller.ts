import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Query,
    UseGuards,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nuevo cliente' })
    @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos o DNI ya registrado' })
    async create(@Body() createClientDto: CreateClientDto) {
        try {
            return await this.clientsService.create(createClientDto);
        } catch (error) {
            if (error.message.includes('DNI already exists')) {
                throw new HttpException('Client with this DNI already exists', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Error creating client', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los clientes con filtros' })
    @ApiQuery({ name: 'bono', required: false, description: 'Filtrar por bono (Mi Vivienda/Techo Propio)' })
    @ApiQuery({ name: 'banco', required: false, description: 'Filtrar por banco' })
    @ApiQuery({ name: 'estadoCredito', required: false, description: 'Filtrar por estado de crédito' })
    @ApiResponse({ status: 200, description: 'Lista de clientes' })
    findAll(@Query() filters: any) {
        return this.clientsService.findAll(filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener cliente por ID' })
    @ApiResponse({ status: 200, description: 'Cliente encontrado' })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
    async findOne(@Param('id') id: string) {
        try {
            return await this.clientsService.findOne(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar cliente' })
    @ApiResponse({ status: 200, description: 'Cliente actualizado' })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
    async update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
        try {
            return await this.clientsService.update(id, updateClientDto);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }
}