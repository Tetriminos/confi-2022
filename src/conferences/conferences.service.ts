import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
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
    let conference: Conference;
    try {
      conference = await this.conferencesRepository.findOneOrFail(id, {
        relations: ['bookings'],
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NoConferenceException(id);
      } else {
        throw error;
      }
    }

    return conference;
  }
}
