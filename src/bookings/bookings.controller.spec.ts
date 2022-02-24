import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { ConferencesService } from '../conferences/conferences.service';
import { Conference } from '../conferences/entities/conference.entity';
import { CreateBookingDto } from './dto';
import { MailService } from '../mail/mail.service';

describe('BookingsController', () => {
  let controller: BookingsController;
  let serviceMock: BookingsService;

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
        {
          provide: MailService,
          useValue: {},
        },
      ],
    }).compile();

    serviceMock = module.get<BookingsService>(BookingsService);
    controller = module.get<BookingsController>(BookingsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('/POST create', () => {
    it('should return a created booking without returning the entry code', async () => {
      const requestBody = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testmail@mail.com',
      } as CreateBookingDto;

      const result = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testmail@mail.com',
        conference: {
          id: 1,
          name: 'NestJS Conf',
        } as Conference,
      } as Booking;
      jest.spyOn(serviceMock, 'create').mockResolvedValue(result);

      expect(await controller.create({ conferenceId: '1' }, requestBody)).toBe(
        result,
      );
    });
  });

  describe('/GET findAll', () => {
    it('should return all bookings for the conference', async () => {
      const result = [
        {
          id: 13,
          firstName: 'Test',
          lastName: 'Test1',
          email: 'test@mail.com',
          entryCode: 'VVRKBZ',
          verified: false,
        },
        {
          id: 12,
          firstName: 'Test',
          lastName: 'Test2',
          email: 'test2@mail.com',
          entryCode: 'P5UVY4',
          verified: true,
        },
      ] as Booking[];

      jest.spyOn(serviceMock, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll({ conferenceId: '1' })).toStrictEqual(
        result,
      );
    });
  });

  describe('/DELETE remove', () => {
    it('should delete a booking', async () => {
      const bookingId = '4';
      const result = {
        message: `Successfully deleted booking with the ID ${bookingId}`,
      };

      jest.spyOn(serviceMock, 'remove').mockResolvedValue(result);

      expect(
        await controller.remove({ conferenceId: '1', id: bookingId }),
      ).toStrictEqual({
        message: `Successfully deleted booking with the ID ${bookingId}`,
      });
    });
  });

  describe('/POST verify', () => {
    it('should return a verified booking', async () => {
      const entryCode = 'VVXFZ3';
      const result = {
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'testmail@mail.com',
        entryCode,
        verified: true,
      } as Booking;

      jest.spyOn(serviceMock, 'verify').mockResolvedValue(result);

      expect(
        await controller.verify({ conferenceId: '1' }, { code: entryCode }),
      ).toStrictEqual(result);
    });
  });
});
