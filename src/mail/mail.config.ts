import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerOptionsFactory } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';
import { mailConstants, developmentMailConstants } from './constants';

@Injectable()
export class MailConfigService implements MailerOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createMailerOptions() {
    if (this.configService.get('environment') === 'development') {
      return this._createDevelopmentMailer();
    }

    const defaults = {
      from: mailConstants.from,
    };

    return {
      defaults,
      transport: {
        host: this.configService.get('mailHost'),
        port: this.configService.get('mailPort'),
        secure: this.configService.get('mailSecure'),
        auth: {
          user: this.configService.get('mailUser'),
          pass: this.configService.get('mailPass'),
        },
      },
    };
  }

  async _createDevelopmentMailer() {
    const testAccount = await nodemailer.createTestAccount();

    return {
      transport: {
        ...developmentMailConstants,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      },
    };
  }
}
