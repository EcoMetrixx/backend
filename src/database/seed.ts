import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
        entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();

    const userRepository = dataSource.getRepository(User);

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findOne({
        where: { email: 'user@dwduqs.com' },
    });

    if (existingUser) {
        console.log('Usuario de prueba ya existe');
        await dataSource.destroy();
        return;
    }

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('miVivienda#2024', 10);
    const testUser = userRepository.create({
        email: 'user@dwduqs.com',
        password: hashedPassword,
        name: 'Juan Torres',
        role: 'Asesor Hipotecario',
    });

    await userRepository.save(testUser);
    console.log('Usuario de prueba creado exitosamente:');
    console.log('Email: user@dwduqs.com');
    console.log('Password: miVivienda#2024');

    await dataSource.destroy();
}

seed().catch((error) => {
    console.error('Error al ejecutar seed:', error);
    process.exit(1);
});

