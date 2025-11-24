import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        firstName: string;
        lastName: string;
        dni: string;
        birthDate: Date;
        civilStatus: string;
        email?: string;
        phone?: string;
        address?: string;
        region?: string;
        province?: string;
        employmentType: string;
        occupation?: string;
        jobSeniority?: number;
        familyLoad: number;
        familyIncome: number;
        savings: number;
        debts: number;
        firstHome: boolean;
        notes?: string;
    }) {
        // Verificar si ya existe el cliente


        const client = await this.prisma.client.create({ data });

        // Calcular elegibilidad automáticamente
        await this.calculateEligibility(client.id);

        return client;
    }

    async findAll(filters?: {
        bono?: string;
        banco?: string;
        estadoCredito?: string;
    }) {
        const where: any = {};

        if (filters?.bono) {
            // Filtrar por elegibilidad
            const eligibleClients = await this.prisma.eligibility.findMany({
                where: {
                    program: filters.bono,
                    isEligible: true
                },
                select: { clientId: true }
            });
            where.id = { in: eligibleClients.map(e => e.clientId) };
        }

        return this.prisma.client.findMany({
            where,
            include: {
                eligibilityResults: true,
                simulations: {
                    include: {
                        property: true,
                        bank: true,
                        user: { select: { name: true, email: true } }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });
    }

    async findOne(id: string) {
        const client = await this.prisma.client.findUnique({
            where: { id },
            include: {
                eligibilityResults: true,
                simulations: {
                    include: {
                        property: true,
                        bank: true,
                        user: { select: { name: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        return client;
    }

    async update(id: string, data: Partial<any>) {
        const client = await this.prisma.client.update({
            where: { id },
            data
        });

        // Recalcular elegibilidad si cambiaron datos relevantes
        await this.calculateEligibility(id);

        return client;
    }

    private async calculateEligibility(clientId: string) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId }
        });

        if (!client) return;

        // Eliminar resultados anteriores
        await this.prisma.eligibility.deleteMany({
            where: { clientId }
        });

        // Calcular elegibilidad para Fondo Mi Vivienda
        const fmvEligible = this.checkFMVEligibility(client);
        await this.prisma.eligibility.create({
            data: {
                clientId,
                program: 'Fondo Mi Vivienda',
                isEligible: fmvEligible.eligible,
                reasons: fmvEligible.reasons
            }
        });

        // Calcular elegibilidad para Techo Propio
        const tpEligible = this.checkTPEligibility(client);
        await this.prisma.eligibility.create({
            data: {
                clientId,
                program: 'Techo Propio',
                isEligible: tpEligible.eligible,
                reasons: tpEligible.reasons
            }
        });
    }

    private checkFMVEligibility(client: any) {
        const reasons: string[] = [];

        // Reglas de elegibilidad para FMV
        if (client.familyIncome < 2500) {
            reasons.push('Ingreso familiar insuficiente (mínimo S/ 2,500)');
            return { eligible: false, reasons };
        }

        if (!client.firstHome) {
            reasons.push('Debe ser primera vivienda');
            return { eligible: false, reasons };
        }

        if (client.employmentType === 'Desempleado') {
            reasons.push('No puede ser desempleado');
            return { eligible: false, reasons };
        }

        if (client.jobSeniority && client.jobSeniority < 6) {
            reasons.push('Antigüedad laboral insuficiente (mínimo 6 meses)');
            return { eligible: false, reasons };
        }

        const ratioEndeudamiento = client.debts / client.familyIncome;
        if (ratioEndeudamiento > 0.4) {
            reasons.push('Ratio de endeudamiento demasiado alto');
            return { eligible: false, reasons };
        }

        reasons.push('Elegible para Fondo Mi Vivienda');
        return { eligible: true, reasons };
    }

    private checkTPEligibility(client: any) {
        const reasons: string[] = [];

        // Reglas de elegibilidad para Techo Propio
        if (client.familyIncome > 3715) {
            reasons.push('Ingreso familiar demasiado alto para Techo Propio');
            return { eligible: false, reasons };
        }

        if (!client.firstHome) {
            reasons.push('Debe ser primera vivienda');
            return { eligible: false, reasons };
        }

        if (client.familyLoad < 1) {
            reasons.push('Debe tener al menos un dependiente');
            return { eligible: false, reasons };
        }

        if (client.savings <= 0) {
            reasons.push('Debe tener ahorros disponibles');
            return { eligible: false, reasons };
        }

        reasons.push('Elegible para Techo Propio');
        return { eligible: true, reasons };
    }
}