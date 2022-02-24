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
import mockedMailService from '../utils/mocks/mail.service';
import { confirmationMailConstants } from './constants';
import {
  BookingAlreadyExistsException,
  BookingAlreadyVerifiedException,
  NoBookingException,
  NoConferenceException,
} from '../common/exceptions';

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
          useValue: mockedMailService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    repositoryMock = module.get(getRepositoryToken(Booking));
    conferenceServiceMock = module.get<ConferencesService>(ConferencesService);
    mailMock = module.get<MailService>(MailService);

    jest.clearAllMocks();
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

      const signInConfirmationRegex =
        /Thank you for signing up for the conference\. Your entry code to be used for registration is: [A-Z0-9]{6}\./;

      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockResolvedValue(conferenceResult);
      jest.spyOn(repositoryMock, 'save').mockResolvedValue(result);
      jest.spyOn(repositoryMock, 'findOne').mockResolvedValue(undefined);

      expect(await service.create(7, dto)).toStrictEqual(result);
      expect(mailMock.sendMail).toBeCalledWith(
        expect.objectContaining({
          html: expect.stringMatching(signInConfirmationRegex),
          subject: confirmationMailConstants.subject,
          text: expect.stringMatching(signInConfirmationRegex),
          to: dto.email,
        }),
      );
      expect(repositoryMock.save).toHaveBeenCalledWith({
        ...dto,
        conference: conferenceResult,
        entryCode: expect.any(String),
      });
    });

    it("should throw an exception if the conference doesn't exist", async () => {
      const dto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testmail@mail.com',
      } as CreateBookingDto;

      const conferenceId = 3;

      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockRejectedValueOnce(new NoConferenceException(conferenceId));
      jest.spyOn(repositoryMock, 'findOne');
      jest.spyOn(repositoryMock, 'save');

      await expect(service.create(conferenceId, dto)).rejects.toThrow(
        NoConferenceException,
      );
      expect(repositoryMock.findOne).not.toHaveBeenCalled();
      expect(mailMock.sendMail).not.toHaveBeenCalled();
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw an exception if a booking with the provided email exists', async () => {
      const dto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testmail@mail.com',
      } as CreateBookingDto;

      const conferenceResult = {
        id: 1,
        name: 'NestJS Conf',
      } as Conference;

      const conferenceId = 3;

      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockImplementation(() => Promise.resolve(conferenceResult));
      jest.spyOn(repositoryMock, 'findOne').mockImplementation(() => {
        return Promise.resolve({
          id: 3,
          firstName: 'OtherName',
          lastName: 'OtherLastName',
          email: 'testmail@mail.com',
          entryCode: 'test',
          verified: false,
        } as Booking);
      });
      jest.spyOn(repositoryMock, 'save');

      await expect(service.create(conferenceId, dto)).rejects.toThrow(
        BookingAlreadyExistsException,
      );
      expect(mailMock.sendMail).not.toHaveBeenCalled();
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all bookings for a given conference', async () => {
      const bookings = [
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

      const conferenceResult = {
        id: 1,
        name: 'NestJS Conf',
      } as Conference;

      const conferenceId = 3;

      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockResolvedValue(conferenceResult);
      jest.spyOn(repositoryMock, 'find').mockResolvedValue(bookings);

      expect(await service.findAll(conferenceId)).toBe(bookings);
    });

    it("should throw an exception if the conference doesn't exist", async () => {
      const conferenceId = 4;

      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockRejectedValue(new NoConferenceException(conferenceId));
      jest.spyOn(repositoryMock, 'find');

      await expect(service.findAll(conferenceId)).rejects.toThrow(
        NoConferenceException,
      );
      expect(repositoryMock.find).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a booking', async () => {
      const bookingId = 3;
      const conferenceId = 2;

      const conferenceResult = {
        id: 1,
        name: 'NestJS Conf',
      } as Conference;

      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockResolvedValue(conferenceResult);
      jest
        .spyOn(repositoryMock, 'delete')
        .mockResolvedValue({ raw: undefined, affected: 1 });

      expect(await service.remove(conferenceId, bookingId)).toStrictEqual({
        message: `Successfully deleted booking with the ID ${bookingId}`,
      });
    });

    it("should throw an exception if the conference doesn't exist", async () => {
      const bookingId = 3;
      const conferenceId = 2;

      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockRejectedValue(new NoConferenceException(conferenceId));
      jest.spyOn(repositoryMock, 'delete');

      await expect(service.remove(conferenceId, bookingId)).rejects.toThrow(
        NoConferenceException,
      );
      expect(repositoryMock.delete).not.toHaveBeenCalled();
    });

    it("should throw an exception if the booking doesn't exist", async () => {
      const bookingId = 3;
      const conferenceId = 2;

      const conferenceResult = {
        id: 1,
        name: 'NestJS Conf',
      } as Conference;

      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockResolvedValue(conferenceResult);
      jest
        .spyOn(repositoryMock, 'delete')
        .mockResolvedValue({ raw: undefined, affected: 0 });

      await expect(service.remove(conferenceId, bookingId)).rejects.toThrow(
        NoBookingException,
      );
      expect(repositoryMock.delete).toHaveBeenCalledWith({
        conference: conferenceResult,
        id: bookingId,
      });
    });
  });

  describe('verify', () => {
    it('should verify an entry code and mark the booking as verified', async () => {
      const entryCode = 'VVRKBZ';
      const conferenceId = 2;
      const booking = {
        id: 13,
        firstName: 'Test',
        lastName: 'Test1',
        email: 'test@mail.com',
        entryCode,
        verified: false,
      } as Booking;

      const conferenceResult = {
        id: 1,
        name: 'NestJS Conf',
      } as Conference;

      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockResolvedValue(conferenceResult);
      jest.spyOn(repositoryMock, 'findOne').mockResolvedValue(booking);
      jest.spyOn(repositoryMock, 'save').mockResolvedValue({
        ...booking,
        verified: true,
      });

      expect(await service.verify(conferenceId, entryCode)).toStrictEqual({
        ...booking,
        verified: true,
      });
    });

    it("should throw an exception if the conference doesn't exist", async () => {
      const entryCode = 'VVRKBZ';
      const conferenceId = 2;

      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockRejectedValue(new NoConferenceException(conferenceId));
      jest.spyOn(repositoryMock, 'findOne');
      jest.spyOn(repositoryMock, 'save');

      await expect(service.verify(conferenceId, entryCode)).rejects.toThrow(
        NoConferenceException,
      );
      expect(repositoryMock.findOne).not.toHaveBeenCalled();
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });

    it("should throw an exception if the booking doesn't exist", async () => {
      const entryCode = 'VVRKBZ';
      const conferenceId = 2;

      const conferenceResult = {
        id: 1,
        name: 'NestJS Conf',
      } as Conference;

      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockResolvedValue(conferenceResult);
      jest.spyOn(repositoryMock, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(repositoryMock, 'save');

      await expect(service.verify(conferenceId, entryCode)).rejects.toThrow(
        NoBookingException,
      );
    });

    it('should throw an exception if the booking has already been verified', async () => {
      const entryCode = 'VVRKBZ';
      const booking = {
        id: 13,
        firstName: 'Test',
        lastName: 'Test1',
        email: 'test@mail.com',
        entryCode,
        verified: true,
      } as Booking;
      const conferenceId = 2;

      const conferenceResult = {
        id: 1,
        name: 'NestJS Conf',
      } as Conference;

      jest
        .spyOn(conferenceServiceMock, 'findOne')
        .mockResolvedValue(conferenceResult);
      jest.spyOn(repositoryMock, 'findOne').mockResolvedValue(booking);
      jest.spyOn(repositoryMock, 'save');

      await expect(service.verify(conferenceId, entryCode)).rejects.toThrow(
        BookingAlreadyVerifiedException,
      );
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('_generateEntryCode', () => {
    it('should return a random alphanumeric entry code', async () => {
      const conference = {
        id: 1,
        name: 'NestJS Conf',
      } as Conference;

      jest.spyOn(repositoryMock, 'findOne').mockResolvedValue(undefined);

      expect(await service._generateEntryCode(conference)).toMatch(/[A-Z0-9]/);
    });

    it('should return a different entry code if the random code already exists within this conference', async () => {
      const entryCode = 'VVRKBZ';
      const booking = {
        id: 13,
        firstName: 'Test',
        lastName: 'Test1',
        email: 'test@mail.com',
        entryCode,
        verified: false,
      } as Booking;

      const conference = {
        id: 1,
        name: 'NestJS Conf',
      } as Conference;

      jest
        .spyOn(repositoryMock, 'findOne')
        .mockResolvedValueOnce(booking)
        .mockResolvedValueOnce(undefined);
      jest
        .spyOn(service, '_generateRandomAlphanumericCode')
        .mockReturnValueOnce(entryCode);

      const returnedEntryCode = await service._generateEntryCode(conference);
      expect(returnedEntryCode).not.toBe(entryCode);
      expect(returnedEntryCode).toMatch(/[A-Z0-9]/);
    });
  });
});
