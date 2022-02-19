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
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  NoConferenceFilter,
  BookingAlreadyExistsFilter,
  NoBookingFilter,
} from '../common/filters';
import { ConferenceIdParamDto } from './dto/conference-id-param.dto';
import { RemoveBookingParamsDto } from './dto/remove-booking-params.dto';
import { BookingCodeQueryParamDto } from './dto/booking-code-query-param.dto';
import { conferenceIdParamSwaggerOptions } from './constants';

@ApiBearerAuth()
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseFilters(NoConferenceFilter, BookingAlreadyExistsFilter)
  @ApiParam(conferenceIdParamSwaggerOptions)
  create(
    @Param() { conferenceId }: ConferenceIdParamDto,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(+conferenceId, createBookingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiParam(conferenceIdParamSwaggerOptions)
  findAll(@Param() { conferenceId }: ConferenceIdParamDto) {
    return this.bookingsService.findAll(+conferenceId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @UseFilters(NoBookingFilter)
  @ApiParam(conferenceIdParamSwaggerOptions)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Booking ID',
  })
  remove(@Param() { conferenceId, id }: RemoveBookingParamsDto) {
    return this.bookingsService.remove(+conferenceId, +id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @ApiParam(conferenceIdParamSwaggerOptions)
  @ApiQuery({
    name: 'code',
    type: 'string',
    description: 'Verification code for a booking booked to this conference',
  })
  verify(
    @Param() { conferenceId }: ConferenceIdParamDto,
    @Query() { code }: BookingCodeQueryParamDto,
  ) {
    return this.bookingsService.verify(+conferenceId, code);
  }
}
