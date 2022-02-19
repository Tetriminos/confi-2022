import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import helmet from 'helmet';
import appConfiguration from './config/app.config';
import dbConfiguration from './config/db.config';
import { ConferencesModule } from './conferences/conferences.module';
import { BookingsModule } from './bookings/bookings.module';
import { TypeOrmConfigService } from './db/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { LoggerMiddleware } from './common/middleware';

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
    MailModule,
    ConferencesModule,
    BookingsModule,
    AuthModule,
    UsersModule,
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
  providers: [UsersService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(helmet(), LoggerMiddleware)
      .forRoutes('conferences', 'admin');
  }
}
