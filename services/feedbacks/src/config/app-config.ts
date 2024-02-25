import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

function appConfig(app: INestApplication): INestApplication {
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  return app;
}

export default appConfig;
