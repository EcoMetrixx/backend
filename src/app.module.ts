import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { BanksModule } from './modules/banks/banks.module';
import { SimulationModule } from './modules/simulation/simulation.module';
import { ContextModule } from './modules/context/context.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    ClientsModule,
    PropertiesModule,
    BanksModule,
    SimulationModule,
    ContextModule,
  ],
})
export class AppModule { }