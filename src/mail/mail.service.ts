import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';
import { mailConstants } from './constants';
import { UnableToSendEmailException } from '../common/exceptions';

type SendEmailOptions = Pick<
  ISendMailOptions,
  'to' | 'subject' | 'text' | 'html'
> &
  Partial<ISendMailOptions>;

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger('MAIL_SERVICE');

  async sendMail(options: SendEmailOptions) {
    let info;
    try {
      info = await this.mailerService.sendMail({
        from: mailConstants.fromEmail,
        ...options,
      });
    } catch (err) {
      this.logger.error(
        `Error while trying to send email to "${options.to}", error message: ${err.message}`,
        err.stack,
      );
      throw new UnableToSendEmailException();
    }

    this.logger.log(`Message sent: ${info.messageId}`);

    if (this.configService.get('environment') === 'development') {
      this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  }
}
