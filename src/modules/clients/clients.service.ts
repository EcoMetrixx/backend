import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService} from 'prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    // 👇 armamos el objeto data como any para no pelear con los tipos de Prisma
    const data: any = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      dni: dto.dni,
      birthDate: new Date(dto.birthDate), // birthDate ahora es string obligatorio
      civilStatus: dto.civilStatus ?? 'Soltero',
      email: dto.email,
    };

    // Campos opcionales solo se agregan si vienen definidos
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.region !== undefined) data.region = dto.region;
    if (dto.province !== undefined) data.province = dto.province;

    if (dto.employmentType !== undefined)
      data.employmentType = dto.employmentType;
    if (dto.occupation !== undefined) data.occupation = dto.occupation;
    if (dto.jobSeniority !== undefined)
      data.jobSeniority = dto.jobSeniority;
    if (dto.familyLoad !== undefined) data.familyLoad = dto.familyLoad;
    if (dto.familyIncome !== undefined)
      data.familyIncome = dto.familyIncome;
    if (dto.savings !== undefined) data.savings = dto.savings;
    if (dto.debts !== undefined) data.debts = dto.debts;
    if (dto.firstHome !== undefined) data.firstHome = dto.firstHome;

    if (dto.bonus !== undefined) data.bonus = dto.bonus;
    if (dto.creditStatus !== undefined)
      data.creditStatus = dto.creditStatus;
    if (dto.notes !== undefined) data.notes = dto.notes;

    // 👉 persistimos las selecciones del dashboard
    if (dto.bank !== undefined) data.bank = dto.bank;
    if (dto.propertyId !== undefined) data.propertyId = dto.propertyId;

    return this.prisma.client.create({ data });
  }

  async findAll(filters: any) {
    const where: any = {};

    if (filters.bono) {
      where.bonus = filters.bono;
    }

    if (filters.banco) {
      where.bank = filters.banco;
    }

    if (filters.estadoCredito) {
      where.creditStatus = filters.estadoCredito;
    }

    return this.prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    const exists = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const data: any = { ...dto };

    if (dto.birthDate) {
      data.birthDate = new Date(dto.birthDate);
    }

    return this.prisma.client.update({
      where: { id },
      data,
    });
  }
}
