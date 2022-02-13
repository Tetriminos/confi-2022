import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { ConferencesService } from '../conferences/conferences.service';
import { Conference } from '../conferences/entities/conference.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: BookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: {},
        },
        {
          provide: ConferencesService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    controller = module.get<BookingsController>(BookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return a created booking', async () => {
      const requestBody = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testmail@mail.com',
      } as CreateBookingDto;

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
        .spyOn(service, 'create')
        .mockImplementation(() => Promise.resolve(result));

      expect(await controller.create('1', requestBody)).toBe(result);
    });
  });
});
