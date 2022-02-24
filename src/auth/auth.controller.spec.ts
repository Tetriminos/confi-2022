import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /login', () => {
    const user = {
      username: 'admin',
      password: 'test',
    };

    const returnedAccessTokenObject = { access_token: 'ssss' };

    beforeEach(() => {
      jest.spyOn(service, 'login').mockResolvedValue(returnedAccessTokenObject);
    });

    it('should call the auth services login method when given a valid user object', async () => {
      expect(await controller.login(user)).toStrictEqual(
        returnedAccessTokenObject,
      );
    });
  });
});
