import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ConferencesService } from './conferences.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiBearerAuth()
@Controller()
export class ConferencesController {
  constructor(private readonly conferencesService: ConferencesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.conferencesService.findAll();
  }
}
