import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { BookingAlreadyVerifiedException } from '../exceptions';

@Catch(BookingAlreadyVerifiedException)
export class BookingAlreadyVerifiedFilter implements ExceptionFilter {
  catch(exception: BookingAlreadyVerifiedException, host: ArgumentsHost) {
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
