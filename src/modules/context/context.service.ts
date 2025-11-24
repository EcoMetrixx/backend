import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ContextService {
    constructor(private prisma: PrismaService) { }

    async setActiveClient(userId: string, clientId: string) {
        // Verificar que el cliente existe y pertenece al usuario (a través de simulaciones)
        const client = await this.prisma.client.findFirst({
            where: {
                id: clientId,
                simulations: {
                    some: { userId }
                }
            }
        });

        if (!client) {
            throw new Error('Client not found or not accessible by this user');
        }

        // Aquí podrías guardar en Redis o base de datos el cliente activo
        // Por simplicidad, retornamos la información del cliente activo
        const eligibility = await this.prisma.eligibility.findMany({
            where: { clientId },
        });

        const activeProgram = eligibility.find(e => e.isEligible)?.program || null;

        return {
            activeClient: {
                id: client.id,
                name: `${client.firstName} ${client.lastName}`,
                dni: client.dni,
                activeProgram,
                status: activeProgram ? 'Elegible' : 'No elegible'
            }
        };
    }

    async getActiveClient(userId: string) {
        // En una implementación real, esto vendría de Redis/cache
        // Por ahora, retornamos el último cliente usado
        const lastSimulation = await this.prisma.simulation.findFirst({
            where: { userId },
            include: {
                client: {
                    include: {
                        eligibilityResults: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!lastSimulation) {
            return { activeClient: null };
        }

        const client = lastSimulation.client;
        const activeEligibility = client.eligibilityResults.find(e => e.isEligible);

        return {
            activeClient: {
                id: client.id,
                name: `${client.firstName} ${client.lastName}`,
                dni: client.dni,
                activeProgram: activeEligibility?.program || null,
                status: activeEligibility ? 'Elegible' : 'No elegible'
            }
        };
    }

    async clearActiveClient(userId: string) {
        // Limpiar cliente activo
        return { activeClient: null };
    }

    async getClientHistory(userId: string, clientId: string) {
        const simulations = await this.prisma.simulation.findMany({
            where: {
                userId,
                clientId
            },
            include: {
                property: { select: { name: true, price: true } },
                bank: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            clientId,
            totalSimulations: simulations.length,
            simulations,
            lastActivity: simulations[0]?.createdAt || null
        };
    }
}