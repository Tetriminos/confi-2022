import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConferencesService } from './conferences.service';
import { Conference } from './entities/conference.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { NoConferenceException } from '../common/exceptions';

describe('ConferencesService', () => {
  let service: ConferencesService;
  let repositoryMock: Repository<Conference>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConferencesService,
        {
          provide: getRepositoryToken(Conference),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ConferencesService>(ConferencesService);
    repositoryMock = module.get(getRepositoryToken(Conference));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all conferences', async () => {
      const result = [
        {
          id: 1,
          name: 'NestJS Conf',
          bookings: [
            {
              id: 1,
              firstName: 'Test',
              lastName: 'User',
              email: 'testmail@mail.com',
              entryCode: 'test',
            } as Booking,
          ],
        } as Conference,
      ] as Conference[];
      jest.spyOn(repositoryMock, 'find').mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return all conferences', async () => {
      const result = {
        id: 1,
        name: 'NestJS Conf',
        bookings: [
          {
            id: 1,
            firstName: 'Test',
            lastName: 'User',
            email: 'testmail@mail.com',
            entryCode: 'test',
          } as Booking,
        ],
      } as Conference;
      jest.spyOn(repositoryMock, 'findOne').mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
    });

    it("should throw an exception if the conference doesn't exist", async () => {
      jest.spyOn(repositoryMock, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow(NoConferenceException);
    });
  });
});
