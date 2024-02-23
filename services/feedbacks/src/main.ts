import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import appConfig from './config/app-config';
import { NestExpressApplication } from '@nestjs/platform-express';

const DOCS_DESCRIPTION =
  'The Feedback/Reviews API enables applications to collect, manage, and aggregate user feedback and reviews for various services or products. This API provides endpoints for submitting feedback.';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  appConfig(app);

  const config = new DocumentBuilder()
    .setTitle('Feedback/Reviews API')
    .setDescription(DOCS_DESCRIPTION)
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const configService = app.get<ConfigService>(ConfigService);

  await app.listen(configService.get<number>('PORT'));
}

bootstrap();
