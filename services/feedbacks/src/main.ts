import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import appConfig from './config/app-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appConfig(app);

  const configService = app.get<ConfigService>(ConfigService);

  await app.listen(configService.get<number>('PORT'));
}

bootstrap();
