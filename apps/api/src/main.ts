import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config({ path: '.env' });
  app.enableCors({
    origin: 'http://localhost:8100',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
  console.log(`API running on http://localhost:${process.env.PORT || 3000}/api`);
}

bootstrap();
