import { Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
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

    const entryCode = await this._generateEntryCode(conferenceId);

    await this._sendConfirmationEmail(createBookingDto.email, entryCode);

    const bookingWithConference = await this.bookingRepository.save({
      conference,
      entryCode,
      ...createBookingDto,
    });

    // we create a new object called booking, where we remove the conference object appended by `save`
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { conference: _, ...booking } = bookingWithConference;
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

  async verify(conferenceId: number, entryCode: string) {
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

  async _generateEntryCode(conferenceId) {
    const conference = await this.conferencesService.findOne(conferenceId);
    const entryCode = this._generateRandomAlphanumericCode();

    const bookingWithEntryCodeExists = await this.bookingRepository.findOne({
      entryCode,
      conference,
    });

    if (bookingWithEntryCodeExists) {
      return this._generateEntryCode(conferenceId);
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
