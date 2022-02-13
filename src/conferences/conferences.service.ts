import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conference } from './entities/conference.entity';

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
    return this.conferencesRepository.findOneOrFail(id, {
      relations: ['bookings'],
    });
  }
}
