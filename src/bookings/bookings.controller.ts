import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseFilters,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  NoConferenceFilter,
  BookingAlreadyExistsFilter,
  NoBookingFilter,
} from '../common/filters';

@ApiBearerAuth()
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseFilters(NoConferenceFilter, BookingAlreadyExistsFilter)
  create(
    @Param('conferenceId') conferenceId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(+conferenceId, createBookingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Param('conferenceId') conferenceId: string) {
    return this.bookingsService.findAll(+conferenceId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @UseFilters(NoBookingFilter)
  remove(@Param('conferenceId') conferenceId: string, @Param('id') id: string) {
    return this.bookingsService.remove(+conferenceId, +id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  verify(
    @Param('conferenceId') conferenceId: string,
    @Query('code') code: string,
  ) {
    console.log(code);
    return this.bookingsService.verify(+conferenceId, code);
  }
}
