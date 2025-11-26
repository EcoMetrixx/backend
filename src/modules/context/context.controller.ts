import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ContextService } from './context.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Context')
@Controller('context')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContextController {
    constructor(private readonly contextService: ContextService) { }

    @Post('active-client/:clientId')
    @ApiOperation({ summary: 'Establecer cliente activo' })
    @ApiResponse({ status: 201, description: 'Cliente activo establecido' })
    setActiveClient(@Param('clientId') clientId: string, @Req() req: any) {
        return this.contextService.setActiveClient(req.user.id, clientId);
    }

    @Get('active-client')
    @ApiOperation({ summary: 'Obtener cliente activo' })
    @ApiResponse({ status: 200, description: 'Cliente activo actual' })
    getActiveClient(@Req() req: any) {
        return this.contextService.getActiveClient(req.user.id);
    }

    @Delete('active-client')
    @ApiOperation({ summary: 'Limpiar cliente activo' })
    @ApiResponse({ status: 200, description: 'Cliente activo limpiado' })
    clearActiveClient(@Req() req: any) {
        return this.contextService.clearActiveClient(req.user.id);
    }

    @Get('client-history/:clientId')
    @ApiOperation({ summary: 'Obtener historial de simulaciones de un cliente' })
    @ApiResponse({ status: 200, description: 'Historial del cliente' })
    getClientHistory(@Param('clientId') clientId: string, @Req() req: any) {
        return this.contextService.getClientHistory(req.user.id, clientId);
    }
}