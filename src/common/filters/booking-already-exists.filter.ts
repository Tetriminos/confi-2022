import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { BookingAlreadyExistsException } from '../exceptions';

@Catch(BookingAlreadyExistsException)
export class BookingAlreadyExistsFilter implements ExceptionFilter {
  catch(exception: BookingAlreadyExistsException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
