import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { mailConstants } from './constants';
import * as nodemailer from 'nodemailer';

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
    const info = await this.mailerService.sendMail({
      from: mailConstants.fromEmail,
      ...options,
    });

    this.logger.log(`Message sent: ${info.messageId}`);

    if (this.configService.get('environment') === 'development') {
      this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  }
}
