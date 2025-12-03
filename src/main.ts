// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// 👇 AGREGA ESTO
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // 👇 CAMBIA ESTA LÍNEA
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 👇 AGREGA ESTO: servir carpeta /downloads como estático
  app.useStaticAssets(join(process.cwd(), 'downloads'), {
    prefix: '/downloads/',
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('EcoMetrix API')
    .setDescription('API for real estate financial simulations')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT) || 9000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on port ${port}`);
  console.log('DATABASE_URL RUNTIME =>', process.env.DATABASE_URL);
}

bootstrap();
