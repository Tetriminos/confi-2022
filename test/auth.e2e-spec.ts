import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import appTestConfiguration from '../src/config/app.config';
import { AppModule } from '../src/app.module';
import { validationPipeOptions } from '../src/common/pipes';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/admin/login (POST)', () => {
    it('should return an access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/login')
        .send({ username: 'admin', password: 'e2e' })
        .expect(200);

      expect(response.body).toStrictEqual({
        access_token: expect.any(String),
      });

      const jwtSecret = appTestConfiguration().jwtSecret;

      expect(jwt.verify(response.body.access_token, jwtSecret)).toBeTruthy();
    });

    it('should return HTTP 401 if the password is wrong', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/login')
        .send({ username: 'admin', password: 'wrongPassword' })
        .expect(401);

      expect(response.body).toStrictEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });

      expect(response.body.access_token).toBeUndefined();
    });

    it('should return HTTP 401 if body contents are wrong (for admin login only)', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/login')
        .send({ username: 'admin', test: '333' })
        .expect(401);

      expect(response.body).toStrictEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });

      expect(response.body.access_token).toBeUndefined();
    });
  });
});
