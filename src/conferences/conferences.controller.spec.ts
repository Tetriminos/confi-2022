import { Test, TestingModule } from '@nestjs/testing';
import { ConferencesController } from './conferences.controller';
import { ConferencesService } from './conferences.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conference } from './entities/conference.entity';
import { Repository } from 'typeorm';

describe('ConferencesController', () => {
  let controller: ConferencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConferencesController],
      providers: [
        ConferencesService,
        {
          provide: getRepositoryToken(Conference),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<ConferencesController>(ConferencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
