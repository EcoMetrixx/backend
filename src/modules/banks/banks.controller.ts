import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Banks')
@Controller('banks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BanksController {
    constructor(private readonly banksService: BanksService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nuevo banco' })
    @ApiResponse({ status: 201, description: 'Banco creado exitosamente' })
    async create(@Body() createBankDto: CreateBankDto) {
        try {
            return await this.banksService.create(createBankDto);
        } catch (error) {
            throw new HttpException('Error creating bank', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los bancos' })
    @ApiResponse({ status: 200, description: 'Lista de bancos' })
    findAll() {
        return this.banksService.findAll();
    }

    @Get('available/:clientId')
    @ApiOperation({ summary: 'Obtener bancos disponibles para un cliente' })
    @ApiResponse({ status: 200, description: 'Bancos disponibles para el cliente' })
    async getAvailableBanksForClient(@Param('clientId') clientId: string) {
        try {
            return await this.banksService.getAvailableBanksForClient(clientId);
        } catch (error) {
            throw new HttpException('Error getting available banks', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener banco por ID' })
    @ApiResponse({ status: 200, description: 'Banco encontrado' })
    @ApiResponse({ status: 404, description: 'Banco no encontrado' })
    async findOne(@Param('id') id: string) {
        try {
            return await this.banksService.findOne(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar banco' })
    @ApiResponse({ status: 200, description: 'Banco actualizado' })
    async update(@Param('id') id: string, @Body() updateBankDto: UpdateBankDto) {
        try {
            return await this.banksService.update(id, updateBankDto);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar banco' })
    @ApiResponse({ status: 200, description: 'Banco eliminado' })
    remove(@Param('id') id: string) {
        return this.banksService.remove(id);
    }
}