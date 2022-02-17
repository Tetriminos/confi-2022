import { HttpException, HttpStatus } from '@nestjs/common';

export class NoBookingException extends HttpException {
  constructor(bookingId?) {
    const response = bookingId
      ? `No booking with the ID ${bookingId}`
      : 'Booking not found';
    super(response, HttpStatus.NOT_FOUND);
  }
}
