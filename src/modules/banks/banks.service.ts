import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BanksService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        name: string;
        interestRate: number;
        description?: string;
        tea?: number;
        tem?: number;
        adminFees?: number;
        gracePeriod?: number;
        evaluationFee?: number;
        lifeInsurance?: number;
        availableTerms?: number[];
        maxFinancing?: number;
    }) {
        return this.prisma.bank.create({ data });
    }

    async findAll() {
        return this.prisma.bank.findMany({
            include: {
                properties: {
                    where: { status: 'disponible' },
                    select: { id: true, name: true, price: true }
                },
                simulations: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: { id: true, amount: true, monthlyPayment: true, createdAt: true }
                }
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const bank = await this.prisma.bank.findUnique({
            where: { id },
            include: {
                properties: true,
                simulations: {
                    include: {
                        user: { select: { name: true } },
                        client: { select: { firstName: true, lastName: true } },
                        property: { select: { name: true } }
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!bank) {
            throw new NotFoundException('Bank not found');
        }

        return bank;
    }

    async update(id: string, data: Partial<any>) {
        return this.prisma.bank.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.bank.delete({
            where: { id },
        });
    }

    async getAvailableBanksForClient(clientId: string) {
        // Obtener elegibilidad del cliente
        const eligibility = await this.prisma.eligibility.findMany({
            where: { clientId },
        });

        // Lógica para determinar qué bancos están disponibles
        // basado en la elegibilidad y políticas de cada banco
        return this.prisma.bank.findMany({
            include: {
                properties: {
                    where: { status: 'disponible' },
                },
            },
        });
    }
}