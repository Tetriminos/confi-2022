import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfiguration from './config/app.config';
import dbConfiguration from './config/db.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConferencesModule } from './conferences/conferences.module';
import { BookingsModule } from './bookings/bookings.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './db/database.config';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfiguration, dbConfiguration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    ConferencesModule,
    BookingsModule,
    RouterModule.register([
      {
        path: '/conferences',
        module: ConferencesModule,
        children: [
          {
            path: '/:conferenceId/bookings',
            module: BookingsModule,
          },
        ],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
