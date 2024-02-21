import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import appConfig from './config/app-config';

const DOCS_DESCRIPTION =
  'The Feedback/Rating API enables applications to collect, manage, and aggregate user feedback and ratings for various services or products. This API provides endpoints for submitting feedback.';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appConfig(app);

  const config = new DocumentBuilder()
    .setTitle('Feedback/Rating API')
    .setDescription(DOCS_DESCRIPTION)
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const configService = app.get<ConfigService>(ConfigService);

  await app.listen(configService.get<number>('PORT'));
}

bootstrap();
