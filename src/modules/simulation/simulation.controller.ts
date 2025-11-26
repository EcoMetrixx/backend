import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { CalculateLoanDto } from './dto/calculate-loan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Simulation')
@Controller('simulation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SimulationController {
    constructor(private readonly simulationService: SimulationService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nueva simulación' })
    @ApiResponse({ status: 201, description: 'Simulación creada exitosamente' })
    async create(@Body() createSimulationDto: CreateSimulationDto, @Req() req: any) {
        try {
            return await this.simulationService.create({
                ...createSimulationDto,
                userId: req.user.id
            });
        } catch (error) {
            throw new HttpException('Error creating simulation', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('calculate')
    @ApiOperation({ summary: 'Calcular préstamo hipotecario' })
    @ApiResponse({ status: 201, description: 'Cálculo realizado exitosamente' })
    async calculateLoan(@Body() calculateLoanDto: CalculateLoanDto) {
        try {
            return await this.simulationService.calculateLoan(calculateLoanDto);
        } catch (error) {
            throw new HttpException('Error calculating loan', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    @ApiOperation({ summary: 'Obtener simulaciones del usuario' })
    @ApiResponse({ status: 200, description: 'Lista de simulaciones' })
    findAll(@Req() req: any, @Query() filters: any) {
        return this.simulationService.findAll(req.user.id, filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener simulación por ID' })
    @ApiResponse({ status: 200, description: 'Simulación encontrada' })
    @ApiResponse({ status: 404, description: 'Simulación no encontrada' })
    async findOne(@Param('id') id: string, @Req() req: any) {
        try {
            return await this.simulationService.findOne(id, req.user.id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get(':id/export/excel')
    @ApiOperation({ summary: 'Exportar simulación a Excel' })
    @ApiResponse({ status: 200, description: 'Excel generado' })
    async exportToExcel(@Param('id') id: string, @Req() req: any) {
        try {
            return await this.simulationService.exportToExcel(id, req.user.id);
        } catch (error) {
            throw new HttpException('Error exporting to Excel', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id/export/pdf')
    @ApiOperation({ summary: 'Exportar simulación a PDF' })
    @ApiResponse({ status: 200, description: 'PDF generado' })
    async exportToPDF(@Param('id') id: string, @Req() req: any) {
        try {
            return await this.simulationService.exportToPDF(id, req.user.id);
        } catch (error) {
            throw new HttpException('Error exporting to PDF', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}