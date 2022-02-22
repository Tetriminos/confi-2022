import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { ConferencesService } from '../conferences/conferences.service';
import { Conference } from '../conferences/entities/conference.entity';
import { CreateBookingDto } from './dto';
import { MailService } from '../mail/mail.service';
import { AuthService } from '../auth/auth.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let repositoryMock: Repository<Booking>;
  let conferenceServiceMock: ConferencesService;
  let mailMock: MailService;

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
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    repositoryMock = module.get(getRepositoryToken(Booking));
    conferenceServiceMock = module.get<ConferencesService>(ConferencesService);
    mailMock = module.get<MailService>(MailService);
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
      } as Booking;
      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockImplementation(() => Promise.resolve(conferenceResult));
      jest
        .spyOn(repositoryMock, 'save')
        .mockImplementation(() => Promise.resolve(result));
      jest
        .spyOn(repositoryMock, 'findOne')
        .mockImplementation(() => Promise.resolve(undefined));
      jest
        .spyOn(mailMock, 'sendMail')
        .mockImplementation(() => Promise.resolve(undefined));

      expect(await service.create(7, dto)).toStrictEqual(result);
    });
  });
});
