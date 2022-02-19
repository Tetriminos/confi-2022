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
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  ConferenceIdParamDto,
  RemoveBookingParamsDto,
  BookingCodeQueryParamDto,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  NoConferenceFilter,
  NoBookingFilter,
  BookingAlreadyExistsFilter,
  BookingAlreadyVerifiedFilter,
} from '../common/filters';
import { conferenceIdParamSwaggerOptions } from './constants';

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
  @ApiBearerAuth()
  @Get()
  @ApiParam(conferenceIdParamSwaggerOptions)
  findAll(@Param() { conferenceId }: ConferenceIdParamDto) {
    return this.bookingsService.findAll(+conferenceId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @Get('verify')
  @UseFilters(NoConferenceFilter, BookingAlreadyVerifiedFilter)
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
