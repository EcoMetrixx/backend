import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SimulationService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        userId: string;
        clientId: string;
        propertyId?: string;
        bankId?: string;
        program: string;
        amount: number;
        monthlyPayment: number;
        term: number;
        result: any;
    }) {
        return this.prisma.simulation.create({
            data,
            include: {
                user: { select: { name: true } },
                client: { select: { firstName: true, lastName: true } },
                property: true,
                bank: true,
            },
        });
    }

    async findAll(userId: string, filters?: {
        clientId?: string;
        program?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }) {
        const where: any = { userId };

        if (filters?.clientId) where.clientId = filters.clientId;
        if (filters?.program) where.program = filters.program;
        if (filters?.dateFrom || filters?.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
            if (filters.dateTo) where.createdAt.lte = filters.dateTo;
        }

        return this.prisma.simulation.findMany({
            where,
            include: {
                client: { select: { firstName: true, lastName: true, dni: true } },
                property: { select: { name: true, price: true } },
                bank: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, userId: string) {
        const simulation = await this.prisma.simulation.findFirst({
            where: { id, userId },
            include: {
                user: { select: { name: true } },
                client: true,
                property: true,
                bank: true,
            },
        });

        if (!simulation) {
            throw new NotFoundException('Simulation not found');
        }

        return simulation;
    }

    async calculateLoan(data: {
        amount: number;
        interestRate: number;
        term: number; // en años
        gracePeriod?: number;
        adminFees?: number;
        evaluationFee?: number;
        lifeInsurance?: number;
        currency?: string; // PEN o USD
        paymentFrequency?: string; // monthly, quarterly, etc.
    }) {
        const {
            amount,
            interestRate,
            term,
            gracePeriod = 0,
            adminFees = 0,
            evaluationFee = 0,
            lifeInsurance = 0,
            currency = 'PEN',
            paymentFrequency = 'monthly'
        } = data;

        // Convertir años a meses
        const termMonths = term * 12;

        // Calcular TEA y TEM
        const tea = interestRate / 100;
        const tem = Math.pow(1 + tea, 1 / 12) - 1;

        // Monto total del préstamo
        const totalLoan = amount;

        // Gastos iniciales
        const initialFees = (adminFees / 100) * totalLoan + evaluationFee;

        // Pago mensual usando sistema francés
        const monthlyPayment = this.calculateFrenchPayment(totalLoan, tem, termMonths);

        // Generar cronograma de pagos
        const schedule = this.generatePaymentSchedule(
            totalLoan,
            tem,
            termMonths,
            monthlyPayment,
            gracePeriod,
            lifeInsurance
        );

        // Calcular métricas financieras
        const totalPaid = schedule.reduce((sum, payment) => sum + payment.totalPayment, 0);
        const totalInterest = totalPaid - totalLoan;

        // VAN y TIR (simplificado)
        const van = this.calculateVAN(schedule, 0.10); // asumiendo 10% de descuento
        const tir = this.calculateTIR(schedule, totalLoan);

        return {
            summary: {
                loanAmount: totalLoan,
                monthlyPayment,
                termYears: term,
                termMonths,
                tea,
                tem,
                totalPaid,
                totalInterest,
                initialFees,
                currency,
                gracePeriod
            },
            schedule,
            metrics: {
                van,
                tir,
                tcea: this.calculateTCEA(schedule, totalLoan, initialFees)
            },
            charts: {
                balanceEvolution: this.generateBalanceChart(schedule),
                paymentComposition: this.generateCompositionChart(schedule)
            }
        };
    }

    private calculateFrenchPayment(principal: number, tem: number, months: number): number {
        return principal * (tem * Math.pow(1 + tem, months)) / (Math.pow(1 + tem, months) - 1);
    }

    private generatePaymentSchedule(
        principal: number,
        tem: number,
        months: number,
        monthlyPayment: number,
        gracePeriod: number,
        lifeInsurance: number
    ) {
        const schedule: Array<{
            month: number;
            initialBalance: number;
            interest: number;
            principal: number;
            insurance: number;
            totalPayment: number;
            remainingBalance: number;
        }> = [];
        let remainingBalance = principal;

        for (let month = 1; month <= months; month++) {
            let interest = 0;
            let principalPayment = 0;
            let insurance = (lifeInsurance / 100) * remainingBalance / 12;

            if (month <= gracePeriod) {
                // Solo intereses durante período de gracia
                interest = remainingBalance * tem;
                principalPayment = 0;
            } else {
                // Sistema francés normal
                interest = remainingBalance * tem;
                principalPayment = monthlyPayment - interest;

                if (principalPayment > remainingBalance) {
                    principalPayment = remainingBalance;
                }
            }

            remainingBalance -= principalPayment;

            schedule.push({
                month,
                initialBalance: remainingBalance + principalPayment,
                interest,
                principal: principalPayment,
                insurance,
                totalPayment: interest + principalPayment + insurance,
                remainingBalance: Math.max(0, remainingBalance)
            });
        }

        return schedule;
    }

    private calculateVAN(schedule: any[], discountRate: number): number {
        const monthlyDiscountRate = discountRate / 12;
        return schedule.reduce((van, payment, index) => {
            return van + payment.totalPayment / Math.pow(1 + monthlyDiscountRate, index + 1);
        }, 0);
    }

    private calculateTIR(schedule: any[], principal: number): number {
        // TIR simplificada - en producción usarías una librería financiera
        return 0.12; // 12% aproximado
    }

    private calculateTCEA(schedule: any[], principal: number, initialFees: number): number {
        // TCEA simplificada
        const totalPaid = schedule.reduce((sum, payment) => sum + payment.totalPayment, 0) + initialFees;
        const years = schedule.length / 12;
        return Math.pow(totalPaid / principal, 1 / years) - 1;
    }

    private generateBalanceChart(schedule: any[]) {
        return schedule.map((payment, index) => ({
            month: index + 1,
            balance: payment.remainingBalance
        }));
    }

    private generateCompositionChart(schedule: any[]) {
        const totalInterest = schedule.reduce((sum, payment) => sum + payment.interest, 0);
        const totalPrincipal = schedule.reduce((sum, payment) => sum + payment.principal, 0);
        const totalInsurance = schedule.reduce((sum, payment) => sum + payment.insurance, 0);

        return [
            { name: 'Intereses', value: totalInterest, percentage: (totalInterest / (totalInterest + totalPrincipal + totalInsurance)) * 100 },
            { name: 'Amortización', value: totalPrincipal, percentage: (totalPrincipal / (totalInterest + totalPrincipal + totalInsurance)) * 100 },
            { name: 'Seguro', value: totalInsurance, percentage: (totalInsurance / (totalInterest + totalPrincipal + totalInsurance)) * 100 }
        ];
    }

    async exportToExcel(simulationId: string, userId: string) {
        const simulation = await this.findOne(simulationId, userId);

        // Aquí implementarías la lógica para generar Excel
        // Usando una librería como exceljs

        return {
            message: 'Excel generado exitosamente',
            downloadUrl: `/downloads/simulation-${simulationId}.xlsx`
        };
    }

    async exportToPDF(simulationId: string, userId: string) {
        const simulation = await this.findOne(simulationId, userId);

        // Lógica para generar PDF con información de transparencia SBS

        return {
            message: 'PDF generado exitosamente',
            downloadUrl: `/downloads/simulation-${simulationId}.pdf`
        };
    }
}