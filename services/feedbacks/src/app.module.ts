import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { MongooseConfigService } from './config/mongoose-config.service';
import { FeedbacksController } from './feedbacks/feedbacks.controller';
import { FeedbacksModule } from './feedbacks/feedbacks.module';

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
    FeedbacksModule,
  ],
  controllers: [AppController, FeedbacksController],
  providers: [],
})
export class AppModule {}
