import {
    Controller,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Iniciar sesión' })
    @ApiResponse({ status: 200, description: 'Login exitoso' })
    @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cerrar sesión' })
    @ApiResponse({ status: 200, description: 'Logout exitoso' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    async logout() {
        return this.authService.logout();
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Refrescar token' })
    @ApiResponse({ status: 200, description: 'Token refrescado exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    async refresh(@GetUser() user: any) {
        return this.authService.refresh(user.id);
    }

    @Post('password-reset')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
    @ApiResponse({
        status: 200,
        description: 'Email de recuperación enviado',
    })
    @ApiResponse({ status: 400, description: 'Email inválido' })
    async requestPasswordReset(@Body() passwordResetDto: PasswordResetDto) {
        return this.authService.requestPasswordReset(passwordResetDto.email);
    }

    @Post('password-reset/confirm')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Confirmar recuperación de contraseña' })
    @ApiResponse({
        status: 200,
        description: 'Contraseña restablecida exitosamente',
    })
    @ApiResponse({
        status: 400,
        description: 'Token inválido o expirado',
    })
    async confirmPasswordReset(
        @Body() passwordResetConfirmDto: PasswordResetConfirmDto,
    ) {
        return this.authService.confirmPasswordReset(passwordResetConfirmDto);
    }
}

