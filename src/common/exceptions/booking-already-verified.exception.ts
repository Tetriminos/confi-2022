import { HttpException, HttpStatus } from '@nestjs/common';

export class BookingAlreadyVerifiedException extends HttpException {
  constructor() {
    super(`This bookings has already been verified`, HttpStatus.CONFLICT);
  }
}
