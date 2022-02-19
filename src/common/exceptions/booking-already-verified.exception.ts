import { HttpException, HttpStatus } from '@nestjs/common';

export class BookingAlreadyVerifiedException extends HttpException {
  constructor() {
    super(`This booking has already been verified`, HttpStatus.CONFLICT);
  }
}
