import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { MongooseConfigService } from './config/mongoose-config.service';
import { EventsController } from './events/events.controller';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    EventsModule,
  ],
  controllers: [EventsController],
  providers: [],
})
export class AppModule {}
