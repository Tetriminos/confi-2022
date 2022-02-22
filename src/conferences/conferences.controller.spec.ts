import { Test, TestingModule } from '@nestjs/testing';
import { ConferencesController } from './conferences.controller';
import { ConferencesService } from './conferences.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conference } from './entities/conference.entity';
import { Repository } from 'typeorm';

describe('ConferencesController', () => {
  let controller: ConferencesController;
  let service: ConferencesService;

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

    service = module.get<ConferencesService>(ConferencesService);
    controller = module.get<ConferencesController>(ConferencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    // it('should return all conferences', async () => {
    //   const result = [
    //     {
    //       id: 1,
    //       name: 'NestJS Conf',
    //     } as Conference,
    //   ] as Conference[];
    //   jest
    //     .spyOn(service, 'findAll')
    //     .mockImplementation(() => Promise.resolve(result));
    //
    //   expect(await controller.findAll()).toBe(result);
    // });
  });
});
