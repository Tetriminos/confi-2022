import { Module } from '@nestjs/common';
import { ConferencesService } from './conferences.service';
import { ConferencesController } from './conferences.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conference } from './entities/conference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conference])],
  controllers: [ConferencesController],
  providers: [ConferencesService],
  exports: [ConferencesService],
})
export class ConferencesModule {}
