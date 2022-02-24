import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;
  let mailerServiceMock: MailerService;
  let configServiceMock: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerServiceMock = module.get<MailerService>(MailerService);
    configServiceMock = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    it("should call the mailer service's sendMail method and return it's return value", async () => {
      const sendMailOptions = {
        html: '<h1>hello<h1>',
        subject: 'An email subject',
        text: 'hello',
        to: 'test@mail.com',
      };

      const returnValue = { info: 'test' };

      jest.spyOn(configServiceMock, 'get').mockReturnValue('test');
      jest.spyOn(mailerServiceMock, 'sendMail').mockResolvedValue(returnValue);

      expect(await service.sendMail(sendMailOptions)).toStrictEqual(
        returnValue,
      );

      expect(mailerServiceMock.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        ...sendMailOptions,
      });
    });
  });
});
