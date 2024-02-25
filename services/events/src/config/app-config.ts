import { INestApplication } from '@nestjs/common';
import { ValidationPipe, VersioningType } from '@nestjs/common';

function appConfig(app: INestApplication): INestApplication {
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  return app;
}

export default appConfig;
