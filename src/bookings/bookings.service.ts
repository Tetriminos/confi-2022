import { Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { ConferencesService } from '../conferences/conferences.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @Inject(ConferencesService)
    private conferencesService: ConferencesService,
  ) {}

  async create(conferenceId: number, createBookingDto: CreateBookingDto) {
    const conference = await this.conferencesService.findOne(conferenceId);
    return this.bookingRepository.save({
      conference,
      entryCode: this._generateEntryCode(),
      ...createBookingDto,
    });
  }

  findAll() {
    return `This action returns all bookings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }

  _generateEntryCode() {
    return 'test';
  }
}
