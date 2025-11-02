import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validateEnv } from './env.validation';

async function bootstrap() {
  // ✅ Validate cấu hình trước khi khởi động
  const env = validateEnv(process.env);

  const app = await NestFactory.create(AppModule);
  await app.listen(env.PORT);
}

bootstrap();
