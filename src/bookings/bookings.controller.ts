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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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
import { Booking } from './entities/booking.entity';

@ApiTags('bookings')
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseFilters(NoConferenceFilter, BookingAlreadyExistsFilter)
  @ApiOperation({
    summary: 'Create a new booking',
    description: 'Creates a new booking, sends the entry code via email.',
  })
  @ApiCreatedResponse({
    description: 'Successful booking. Entry code sent via email',
    type: Booking,
  })
  @ApiConflictResponse({
    description: 'A booking with the provided email already exists.',
  })
  @ApiBadRequestResponse()
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
  @ApiOperation({
    summary: 'Return all bookings for a conference',
  })
  @ApiOkResponse({ description: 'An array of bookings', type: [Booking] })
  @ApiBadRequestResponse()
  @ApiParam(conferenceIdParamSwaggerOptions)
  findAll(@Param() { conferenceId }: ConferenceIdParamDto) {
    return this.bookingsService.findAll(+conferenceId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @UseFilters(NoBookingFilter)
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiOkResponse({ description: 'Booking successfully deleted.' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({ description: 'No booking with the provided ID.' })
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
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @UseFilters(NoConferenceFilter, BookingAlreadyVerifiedFilter)
  @ApiOperation({
    summary: 'Verify entry code',
    description:
      'Checks for the entry code across all bookings for a specific conference. The booking is marked as verified.',
  })
  @ApiOkResponse({ description: 'Successfully verified the code.' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse({
    description: "A booking with that entry code hasn't been found.",
  })
  @ApiConflictResponse({ description: 'Booking has already been verified.' })
  @ApiParam(conferenceIdParamSwaggerOptions)
  @ApiQuery({
    name: 'code',
    type: 'string',
    description: 'Entry code for a booking booked to this conference',
  })
  verify(
    @Param() { conferenceId }: ConferenceIdParamDto,
    @Query() { code }: BookingCodeQueryParamDto,
  ) {
    return this.bookingsService.verify(+conferenceId, code);
  }
}
