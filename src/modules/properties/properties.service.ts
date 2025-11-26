import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    price: number;
    location: string;
    region: string;
    province: string;
    type: string;
    description?: string;
    images?: string[];
    status?: string;
    compatibleWith?: string;
    bankId?: string;
  }) {
    return this.prisma.property.create({
      data: {
        ...data,
        status: data.status || 'disponible',
      },
      include: {
        bank: true,
      },
    });
  }

  async findAll(filters?: {
    region?: string;
    province?: string;
    type?: string;
    status?: string;
    compatibleWith?: string;
    bankId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.region) where.region = filters.region;
    if (filters?.province) where.province = filters.province;
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.compatibleWith) where.compatibleWith = filters.compatibleWith;
    if (filters?.bankId) where.bankId = filters.bankId;

    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.property.findMany({
      where,
      include: {
        bank: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        bank: true,
        simulations: {
          include: {
            user: { select: { name: true } },
            client: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async update(id: string, data: Partial<any>) {
    return this.prisma.property.update({
      where: { id },
      data,
      include: {
        bank: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.property.delete({
      where: { id },
    });
  }

  async getCompatibleProperties(clientEligibility: string[]) {
    // Retornar propiedades compatibles con la elegibilidad del cliente
    const compatibleWith =
      clientEligibility.includes('Fondo Mi Vivienda') &&
      clientEligibility.includes('Techo Propio')
        ? 'Ambos'
        : clientEligibility[0];

    return this.prisma.property.findMany({
      where: {
        status: 'disponible',
        OR: [{ compatibleWith: 'Ambos' }, { compatibleWith: compatibleWith }],
      },
      include: {
        bank: true,
      },
    });
  }
}
