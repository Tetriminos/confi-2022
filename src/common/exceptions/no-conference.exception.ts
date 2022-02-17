import { HttpException, HttpStatus } from '@nestjs/common';

export class NoConferenceException extends HttpException {
  constructor(conferenceId) {
    super(`No conference with the ID ${conferenceId}`, HttpStatus.NOT_FOUND);
  }
}
