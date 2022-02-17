import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConferencesService } from './conferences.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

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
