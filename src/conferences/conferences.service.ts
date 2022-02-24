import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conference } from './entities/conference.entity';
import { NoConferenceException } from '../common/exceptions';

@Injectable()
export class ConferencesService {
  constructor(
    @InjectRepository(Conference)
    private conferencesRepository: Repository<Conference>,
  ) {}
  async findAll(): Promise<Conference[]> {
    return this.conferencesRepository.find({
      relations: ['bookings'],
    });
  }

  async findOne(id: number) {
    const conference = await this.conferencesRepository.findOne(id, {
      relations: ['bookings'],
    });

    if (conference === undefined) {
      throw new NoConferenceException(id);
    }

    return conference;
  }
}
