import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  const port = 14438;
  await app.listen(port);
  logger.log(`Listern in http://0.0.0.0:${port}`);
}
bootstrap();
