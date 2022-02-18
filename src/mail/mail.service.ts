import { Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { mailConstants } from './constants';
import { ConfigService } from '@nestjs/config';
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

  async sendMail(options: SendEmailOptions) {
    const info = await this.mailerService.sendMail({
      from: mailConstants.fromEmail,
      ...options,
    });

    // TODO: logger logger.info(`Message sent: ${info.messageId}`);
    //     logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    if (this.configService.get('environment') === 'development') {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  }
}
