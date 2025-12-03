// src/modules/simulation/simulation.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

import * as fs from 'fs';
import { join } from 'path';
import * as ExcelJS from 'exceljs';
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

@Injectable()
export class SimulationService {
  constructor(private prisma: PrismaService) {}

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

  async findAll(
    userId: string,
    filters?: {
      clientId?: string;
      program?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ) {
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
      paymentFrequency = 'monthly',
    } = data;

    const termMonths = term * 12;

    const tea = interestRate / 100;
    const tem =
      interestRate > 3
        ? interestRate / 100 / 12 // TNA
        : Math.pow(1 + tea, 1 / 12) - 1; // TEA

    const totalLoan = amount;

    const initialFees = (adminFees / 100) * totalLoan + evaluationFee;

    const monthlyPayment = this.calculateFrenchPayment(
      totalLoan,
      tem,
      termMonths,
    );

    const schedule = this.generatePaymentSchedule(
      totalLoan,
      tem,
      termMonths,
      monthlyPayment,
      gracePeriod,
      lifeInsurance,
    );

    const totalPaid = schedule.reduce(
      (sum, payment) => sum + payment.totalPayment,
      0,
    );
    const totalInterest = totalPaid - totalLoan;

    const van = this.calculateVAN(schedule, 0.1);
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
        gracePeriod,
      },
      schedule,
      metrics: {
        van,
        tir,
        tcea: this.calculateTCEA(schedule, totalLoan, initialFees),
      },
      charts: {
        balanceEvolution: this.generateBalanceChart(schedule),
        paymentComposition: this.generateCompositionChart(schedule),
      },
    };
  }

  private calculateFrenchPayment(
    principal: number,
    tem: number,
    months: number,
  ): number {
    return (
      (principal * (tem * Math.pow(1 + tem, months))) /
      (Math.pow(1 + tem, months) - 1)
    );
  }

  private generatePaymentSchedule(
    principal: number,
    tem: number,
    months: number,
    monthlyPayment: number,
    gracePeriod: number,
    lifeInsurance: number,
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
      const insurance = ((lifeInsurance / 100) * remainingBalance) / 12;

      if (month <= gracePeriod) {
        interest = remainingBalance * tem;
        principalPayment = 0;
      } else {
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
        remainingBalance: Math.max(0, remainingBalance),
      });
    }

    return schedule;
  }

  private calculateVAN(
    schedule: any[],
    discountRate: number,
    initialInvestment: number = 0,
  ): number {
    const monthlyRate = discountRate / 12;
    let van = -initialInvestment; // flujo inicial

    schedule.forEach((payment, i) => {
      van += payment.totalPayment / Math.pow(1 + monthlyRate, i + 1);
    });

    return van;
  }

  private calculateTIR(schedule: any[], principal: number): number {
    let low = 0;
    let high = 1;
    let guess = 0;

    const npv = (rate: number) => {
      return (
        -principal +
        schedule.reduce((sum, p, i) => {
          return sum + p.totalPayment / Math.pow(1 + rate, i + 1);
        }, 0)
      );
    };

    for (let i = 0; i < 100; i++) {
      guess = (low + high) / 2;
      const value = npv(guess);

      if (Math.abs(value) < 1e-7) break;

      if (value > 0) low = guess;
      else high = guess;
    }

    return guess * 12; // TIR anual
  }

  private calculateTCEA(
    schedule: any[],
    principal: number,
    initialFees: number,
  ): number {
    const cashflows = [-principal - initialFees];

    schedule.forEach((p) => cashflows.push(p.totalPayment));

    let rate = 0.1;
    let lastRate = 0;

    for (let i = 0; i < 50; i++) {
      let npv = 0;
      for (let t = 0; t < cashflows.length; t++) {
        npv += cashflows[t] / Math.pow(1 + rate / 12, t);
      }

      if (Math.abs(npv) < 1e-6) break;

      // derivada numérica
      const epsilon = 0.0001;
      let npv2 = 0;

      for (let t = 0; t < cashflows.length; t++) {
        npv2 += cashflows[t] / Math.pow(1 + (rate + epsilon) / 12, t);
      }

      const derivative = (npv2 - npv) / epsilon;

      lastRate = rate;
      rate = rate - npv / derivative;
    }

    return rate;
  }

  private generateBalanceChart(schedule: any[]) {
    return schedule.map((payment, index) => ({
      month: index + 1,
      balance: payment.remainingBalance,
    }));
  }

  private generateCompositionChart(schedule: any[]) {
    const totalInterest = schedule.reduce(
      (sum, payment) => sum + payment.interest,
      0,
    );
    const totalPrincipal = schedule.reduce(
      (sum, payment) => sum + payment.principal,
      0,
    );
    const totalInsurance = schedule.reduce(
      (sum, payment) => sum + payment.insurance,
      0,
    );

    const total = totalInterest + totalPrincipal + totalInsurance || 1;

    return [
      {
        name: 'Intereses',
        value: totalInterest,
        percentage: (totalInterest / total) * 100,
      },
      {
        name: 'Amortización',
        value: totalPrincipal,
        percentage: (totalPrincipal / total) * 100,
      },
      {
        name: 'Seguro',
        value: totalInsurance,
        percentage: (totalInsurance / total) * 100,
      },
    ];
  }

  // =======================
  //  EXPORTAR A EXCEL
  // =======================
  async exportToExcel(simulationId: string, userId: string) {
    const simulation = await this.findOne(simulationId, userId);

    const downloadsDir = join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const filename = `simulation-${simulationId}.xlsx`;
    const filePath = join(downloadsDir, filename);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Simulación');

    const clientName = simulation.client
      ? `${simulation.client.firstName} ${simulation.client.lastName}`
      : 'N/A';

    const result: any = simulation.result || {};

    sheet.addRow(['Simulación de Crédito']);
    sheet.addRow([]);
    sheet.addRow(['Cliente', clientName]);
    sheet.addRow(['Programa', simulation.program]);
    sheet.addRow(['Monto financiado', simulation.amount]);
    sheet.addRow(['Cuota mensual', simulation.monthlyPayment]);
    sheet.addRow(['Plazo (años)', simulation.term]);
    sheet.addRow([]);
    sheet.addRow(['Indicadores']);
    sheet.addRow(['TCEA', result.tcea ?? '']);
    sheet.addRow(['VAN', result.van ?? '']);
    sheet.addRow(['TIR', result.tir ?? '']);
    sheet.addRow(['Total intereses', result.totalInterests ?? '']);
    sheet.addRow(['Total a pagar', result.totalPayable ?? '']);

    await workbook.xlsx.writeFile(filePath);

    return {
      message: 'Excel generado exitosamente',
      downloadUrl: `/downloads/${filename}`,
    };
  }

  // =======================
  //  EXPORTAR A PDF
  // =======================
  async exportToPDF(simulationId: string, userId: string) {
    const simulation = await this.findOne(simulationId, userId);

    const downloadsDir = join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const filename = `simulation-${simulationId}.pdf`;
    const filePath = join(downloadsDir, filename);

    const clientName = simulation.client
      ? `${simulation.client.firstName} ${simulation.client.lastName}`
      : 'N/A';
    const result: any = simulation.result || {};

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(20).text('Simulación de Crédito', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Cliente: ${clientName}`);
    doc.text(`Programa: ${simulation.program}`);
    doc.text(`Monto financiado: S/ ${simulation.amount}`);
    doc.text(`Cuota mensual: S/ ${simulation.monthlyPayment}`);
    doc.text(`Plazo: ${simulation.term} años`);
    doc.moveDown();

    doc.fontSize(14).text('Indicadores', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`TCEA: ${result.tcea ?? '-'}`);
    doc.text(`VAN: ${result.van ?? '-'}`);
    doc.text(`TIR: ${result.tir ?? '-'}`);
    doc.text(`Total intereses: ${result.totalInterests ?? '-'}`);
    doc.text(`Total a pagar: ${result.totalPayable ?? '-'}`);

    doc.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    });

    return {
      message: 'PDF generado exitosamente',
      downloadUrl: `/downloads/${filename}`,
    };
  }
}
