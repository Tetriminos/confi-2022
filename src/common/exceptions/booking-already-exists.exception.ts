import { HttpException, HttpStatus } from '@nestjs/common';

export class BookingAlreadyExistsException extends HttpException {
  constructor() {
    super(`A booking with this email already exists`, HttpStatus.BAD_REQUEST);
  }
}
