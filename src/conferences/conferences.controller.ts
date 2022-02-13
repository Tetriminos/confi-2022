import { Controller, Get } from '@nestjs/common';
import { ConferencesService } from './conferences.service';

@Controller()
export class ConferencesController {
  constructor(private readonly conferencesService: ConferencesService) {}

  @Get()
  findAll() {
    return this.conferencesService.findAll();
  }
}
