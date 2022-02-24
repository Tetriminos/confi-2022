import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import mockJwtService, { returnValues } from '../utils/mocks/jwt.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: UsersService;
  let jwtServiceMock: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersServiceMock = module.get<UsersService>(UsersService);
    jwtServiceMock = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const user = {
      username: 'admin',
      password: 'password',
    };
    beforeEach(() => {
      jest
        .spyOn(usersServiceMock, 'findOne')
        .mockImplementation(async (username) => {
          if (username === user.username) {
            return Promise.resolve(user);
          } else {
            return Promise.resolve(undefined);
          }
        });
    });
    it('should return a user sans-password if the provided password is correct', async () => {
      expect(
        await service.validateUser(user.username, user.password),
      ).toStrictEqual({ username: user.username });
    });

    it('should return null if the password is incorrect', async () => {
      expect(await service.validateUser(user.username, 'test')).toBe(null);
    });
    it('should return null if no such user exists', async () => {
      expect(await service.validateUser('test', user.password)).toBe(null);
    });
  });

  describe('login', () => {
    const user = {
      username: 'admin',
      userId: '7',
    };

    it('should return an object with an access_token', async () => {
      expect(await service.login(user)).toStrictEqual({
        access_token: returnValues.SIGN_RESULT,
      });
      expect(jwtServiceMock.sign).toBeCalledWith({
        username: user.username,
        sub: user.userId,
      });
    });
  });
});
