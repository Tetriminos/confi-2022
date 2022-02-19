import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { ConferencesService } from '../conferences/conferences.service';
import { Conference } from '../conferences/entities/conference.entity';
import { CreateBookingDto } from './dto';

describe('BookingsService', () => {
  let service: BookingsService;
  let repositoryMock: Repository<Booking>;
  let conferenceServiceMock: ConferencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useClass: Repository,
        },
        {
          provide: ConferencesService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    repositoryMock = module.get(getRepositoryToken(Booking));
    conferenceServiceMock = module.get<ConferencesService>(ConferencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should persist a new booking to the database', async () => {
      const dto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testmail@mail.com',
      } as CreateBookingDto;

      const conferenceResult = {
        id: 1,
        name: 'NestJS Conf',
      } as Conference;

      const result = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testmail@mail.com',
        entryCode: 'test',
        conference: {
          id: 1,
          name: 'NestJS Conf',
        } as Conference,
      } as Booking;
      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockImplementation(() => Promise.resolve(conferenceResult));
      jest
        .spyOn(repositoryMock, 'save')
        .mockImplementation(() => Promise.resolve(result));

      expect(await service.create(7, dto)).toBe(result);
    });
  });
});
