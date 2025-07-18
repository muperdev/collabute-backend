import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  const seederService = app.get(SeederService);

  try {
    console.log('🌱 Starting database seeding...');

    const result = await seederService.seedAll();

    if (result.success) {
      console.log('🎉 Database seeding completed successfully!');
    } else {
      console.error('❌ Database seeding failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
