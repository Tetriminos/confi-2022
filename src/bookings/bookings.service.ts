import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dto';
import { Booking } from './entities/booking.entity';
import { Conference } from '../conferences/entities/conference.entity';
import { ConferencesService } from '../conferences/conferences.service';
import {
  BookingAlreadyExistsException,
  BookingAlreadyVerifiedException,
  NoBookingException,
} from '../common/exceptions';
import { MailService } from '../mail/mail.service';
import { confirmationMailConstants } from './constants';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @Inject(ConferencesService)
    private conferencesService: ConferencesService,
    @Inject(MailService)
    private mailService: MailService,
  ) {}

  async create(conferenceId: number, createBookingDto: CreateBookingDto) {
    const conference = await this.conferencesService.findOne(conferenceId);

    const bookingWithEmailExists = await this.bookingRepository.findOne({
      email: createBookingDto.email,
    });

    if (bookingWithEmailExists) {
      throw new BookingAlreadyExistsException();
    }

    const entryCode = await this._generateEntryCode(conference);

    await this._sendConfirmationEmail(createBookingDto.email, entryCode);

    const bookingWithConference = await this.bookingRepository.save({
      conference,
      entryCode,
      ...createBookingDto,
    });

    // we create a new object called booking, where we remove the conference \n
    // object appended by `save`, and the entry code
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { conference: _, entryCode: __, ...booking } = bookingWithConference;
    return booking;
  }

  async findAll(conferenceId: number): Promise<Booking[]> {
    const conference = await this.conferencesService.findOne(conferenceId);
    return this.bookingRepository.find({
      where: [
        {
          conference,
        },
      ],
    });
  }

  async remove(conferenceId: number, id: number) {
    const conference = await this.conferencesService.findOne(conferenceId);
    const { affected } = await this.bookingRepository.delete({
      id,
      conference,
    });

    if (affected === 0) {
      throw new NoBookingException(id);
    }

    return {
      message: `Successfully deleted booking with the ID ${id}`,
    };
  }

  async verify(conferenceId: number, entryCode: string): Promise<Booking> {
    const conference = await this.conferencesService.findOne(conferenceId);
    const foundBooking = await this.bookingRepository.findOne({
      where: [
        {
          entryCode,
          conference,
        },
      ],
    });

    if (foundBooking === undefined) {
      throw new NoBookingException();
    }

    if (foundBooking.verified === true) {
      throw new BookingAlreadyVerifiedException();
    }

    return this.bookingRepository.save({
      ...foundBooking,
      verified: true,
    });
  }

  async _generateEntryCode(conference: Conference) {
    const entryCode = this._generateRandomAlphanumericCode();
    const bookingWithEntryCodeExists = await this.bookingRepository.findOne({
      entryCode,
      conference,
    });

    // if the entry code already exists for a booking in this conference, we retry
    if (bookingWithEntryCodeExists) {
      return this._generateEntryCode(conference);
    }

    return entryCode;
  }

  _generateRandomAlphanumericCode(length = 6) {
    return Math.random()
      .toString(36) // radix 36 will return alphanumerics
      .substring(2, length + 2) // remove `0.` prefix
      .toUpperCase();
  }

  async _sendConfirmationEmail(email: string, entryCode: string) {
    const text = `Thank you for signing up for the conference. Your entry code to be used for registration is: ${entryCode}.`;
    return this.mailService.sendMail({
      subject: confirmationMailConstants.subject,
      to: email,
      text,
      html: text,
    });
  }
}
