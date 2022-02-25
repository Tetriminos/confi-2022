import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'typeorm';
import { AppModule } from '../src/app.module';
import { validationPipeOptions } from '../src/common/pipes';
import mockedMailService from '../src/utils/mocks/mail.service';
import { confirmationMailConstants } from '../src/bookings/constants';
import { MailerService } from '@nestjs-modules/mailer';
import { TestLogger } from '../src/utils/mocks/test.logger';
import {
  deleteBookingByEmail,
  getBookingByEmail,
  insertBooking,
  seed,
} from './utils/db-utils';
import { getAccessToken } from './utils/auth-utils';

describe('BookingController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let dbConnection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailerService)
      .useValue(mockedMailService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
    app.useLogger(new TestLogger());
    await app.init();

    dbConnection = app.get(Connection);
    await dbConnection.synchronize(true);
    await seed(dbConnection);

    accessToken = await getAccessToken(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/conferences/:id/bookings (POST)', () => {
    it('should create a new booking and return HTTP 201. An email with the verification code should be sent', async () => {
      const booking = {
        firstName: 'Name',
        lastName: 'Surname',
        email: 'test@mail.com',
        id: expect.any(Number),
        verified: false,
      };
      const response = await request(app.getHttpServer())
        .post('/conferences/1/bookings')
        .send({
          firstName: booking.firstName,
          lastName: booking.lastName,
          email: booking.email,
        })
        .expect(201);

      expect(response.body).toStrictEqual(booking);

      const signInConfirmationRegex =
        /Thank you for signing up for the conference\. Your entry code to be used for registration is: [A-Z0-9]{6}\./;
      expect(mockedMailService.sendMail).toHaveBeenCalledWith({
        html: expect.stringMatching(signInConfirmationRegex),
        subject: confirmationMailConstants.subject,
        text: expect.stringMatching(signInConfirmationRegex),
        to: booking.email,
        from: 'confi@mail.com',
      });

      expect(
        await getBookingByEmail(dbConnection, booking.email),
      ).toStrictEqual({
        ...booking,
        conferenceId: 1,
        entryCode: expect.stringMatching(/[A-Z0-9]/),
      });

      await deleteBookingByEmail(dbConnection, booking.email);
    });

    it('should return HTTP 409 if a booking with the email already exists', async () => {
      const response = await request(app.getHttpServer())
        .post('/conferences/1/bookings')
        .send({
          firstName: 'Name',
          lastName: 'Surname',
          email: 'john@mail.com',
        })
        .expect(409);

      expect(response.body).toStrictEqual({
        message: 'A booking with this email already exists',
        statusCode: 409,
      });
    });

    it("should return HTTP 404 if the conference doesn't exist", async () => {
      const response = await request(app.getHttpServer())
        .post('/conferences/2/bookings')
        .send({
          firstName: 'Name',
          lastName: 'Surname',
          email: 'test@mail.com',
        })
        .expect(404);

      expect(response.body).toStrictEqual({
        message: 'No conference with the ID 2',
        statusCode: 404,
      });
    });

    it('should return HTTP 500 if sending the email fails. Booking should not be persisted', async () => {
      jest
        .spyOn(mockedMailService, 'sendMail')
        .mockRejectedValueOnce(new Error('E-postman was attacked by a dog'));
      const response = await request(app.getHttpServer())
        .post('/conferences/1/bookings')
        .send({
          firstName: 'Name',
          lastName: 'Surname',
          email: 'mailfail@mail.com',
        })
        .expect(500);

      expect(response.body).toStrictEqual({
        message: 'Internal server error',
        statusCode: 500,
      });

      expect(
        await getBookingByEmail(dbConnection, 'mailfail@mail.com'),
      ).toBeUndefined();
    });
  });

  describe('/conferences/:id/bookings (GET)', () => {
    it('should get all bookings and return HTTP 200', async () => {
      const expectedBookings = [
        {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@mail.com',
          id: 1,
          verified: false,
          entryCode: 'VV23ZX',
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@mail.com',
          id: 2,
          verified: true,
          entryCode: 'AAABC1',
        },
      ];
      const response = await request(app.getHttpServer())
        .get('/conferences/1/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toStrictEqual(expectedBookings);
    });

    it('should return HTTP 401 if you are not authorized as an admin', async () => {
      const unauthorizedResponse = await request(app.getHttpServer())
        .get('/conferences/1/bookings')
        .expect(401);

      expect(unauthorizedResponse.body).toStrictEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });

      // this is a valid but expired token, signed with the secret `e2e`. If you change your secret, you'll need to regenerate this token
      const expired_access_token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjA1Nzg2MDU1LCJleHAiOjE2MDU3ODk2NTV9.hgH7HfOwi7ct3-iAfpSp5NWIDud3qfBes3lbXCbB6y4';
      const expiredResponse = await request(app.getHttpServer())
        .get('/conferences/1/bookings')
        .set('Authorization', `Bearer ${expired_access_token}`)
        .expect(401);

      expect(expiredResponse.body).toStrictEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });
    });

    it("should return HTTP 404 if the conference doesn't exist", async () => {
      const response = await request(app.getHttpServer())
        .get('/conferences/2/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toStrictEqual({
        message: 'No conference with the ID 2',
        statusCode: 404,
      });
    });
  });

  describe('/conferences/:id/bookings/:bookingId (DELETE)', () => {
    it('should delete a booking', async () => {
      const booking = {
        firstName: 'Sinisa',
        lastName: 'Vuco',
        email: 'vuco@mail.com',
        entryCode: 'AVTMAT',
        verified: false,
        conferenceId: 1,
      };
      const bookingId = await insertBooking(dbConnection, booking);
      const response = await request(app.getHttpServer())
        .delete(`/conferences/1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toStrictEqual({
        message: `Successfully deleted booking with the ID ${bookingId}`,
      });

      expect(
        await getBookingByEmail(dbConnection, booking.email),
      ).toBeUndefined();
    });

    it('should return HTTP 401 if you are not authorized as an admin', async () => {
      const booking = {
        firstName: 'Sinisa',
        lastName: 'Vuco',
        email: 'vuco@mail.com',
        entryCode: 'AVTMAT',
        verified: false,
        conferenceId: 1,
      };
      const bookingId = await insertBooking(dbConnection, booking);
      const unauthorizedResponse = await request(app.getHttpServer())
        .delete(`/conferences/1/bookings/${bookingId}`)
        .expect(401);

      expect(unauthorizedResponse.body).toStrictEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });

      // this is a valid but expired token, signed with the secret `e2e`. If you change your secret, you'll need to regenerate this token
      const expired_access_token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjA1Nzg2MDU1LCJleHAiOjE2MDU3ODk2NTV9.hgH7HfOwi7ct3-iAfpSp5NWIDud3qfBes3lbXCbB6y4';
      const expiredResponse = await request(app.getHttpServer())
        .delete(`/conferences/1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${expired_access_token}`)
        .expect(401);

      expect(expiredResponse.body).toStrictEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });

      expect(
        await getBookingByEmail(dbConnection, booking.email),
      ).not.toBeUndefined();

      await deleteBookingByEmail(dbConnection, booking.email);
    });

    it("should return HTTP 404 if the conference doesn't exist", async () => {
      const response = await request(app.getHttpServer())
        .delete('/conferences/2/bookings/7')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toStrictEqual({
        message: 'No conference with the ID 2',
        statusCode: 404,
      });
    });

    it("should return HTTP 404 if the booking doesn't exist", async () => {
      const response = await request(app.getHttpServer())
        .delete('/conferences/1/bookings/999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toStrictEqual({
        message: 'No booking with the ID 999',
        statusCode: 404,
      });
    });
  });

  describe('/conferences/:id/bookings/verify (POST)', () => {
    it('should verify a booking and mark it as verified', async () => {
      const booking = {
        firstName: 'Sinisa',
        lastName: 'Vuco',
        email: 'vuco@mail.com',
        entryCode: 'AVTMAT',
        verified: false,
        conferenceId: 1,
      };
      await insertBooking(dbConnection, booking);
      const response = await request(app.getHttpServer())
        .post(`/conferences/1/bookings/verify?code=${booking.entryCode}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const verifiedBooking = {
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        entryCode: booking.entryCode,
        verified: true,
        id: expect.any(Number),
      };

      expect(response.body).toStrictEqual(verifiedBooking);

      expect(
        await getBookingByEmail(dbConnection, booking.email),
      ).toStrictEqual({
        ...verifiedBooking,
        conferenceId: 1,
      });

      await deleteBookingByEmail(dbConnection, booking.email);
    });

    it('should return HTTP 401 if you are not authorized as an admin', async () => {
      const booking = {
        firstName: 'Sinisa',
        lastName: 'Vuco',
        email: 'vuco@mail.com',
        entryCode: 'AVTMAT',
        verified: false,
        conferenceId: 1,
      };
      await insertBooking(dbConnection, booking);
      const unauthorizedResponse = await request(app.getHttpServer())
        .post(`/conferences/1/bookings/verify?code=${booking.entryCode}`)
        .expect(401);

      expect(unauthorizedResponse.body).toStrictEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });

      // this is a valid but expired token, signed with the secret `e2e`. If you change your secret, you'll need to regenerate this token
      const expired_access_token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjA1Nzg2MDU1LCJleHAiOjE2MDU3ODk2NTV9.hgH7HfOwi7ct3-iAfpSp5NWIDud3qfBes3lbXCbB6y4';
      const expiredResponse = await request(app.getHttpServer())
        .post(`/conferences/1/bookings/verify?code=${booking.entryCode}`)
        .set('Authorization', `Bearer ${expired_access_token}`)
        .expect(401);

      expect(expiredResponse.body).toStrictEqual({
        statusCode: 401,
        message: 'Unauthorized',
      });

      const notVerifiedBooking = await getBookingByEmail(
        dbConnection,
        booking.email,
      );
      expect(notVerifiedBooking.verified).toBeFalsy();

      await deleteBookingByEmail(dbConnection, booking.email);
    });

    it("should return HTTP 404 if the conference doesn't exist", async () => {
      const response = await request(app.getHttpServer())
        .post(`/conferences/2/bookings/verify?code=AESDFS`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toStrictEqual({
        message: 'No conference with the ID 2',
        statusCode: 404,
      });
    });

    it("should return HTTP 404 if the booking with that entry code doesn't exist", async () => {
      const response = await request(app.getHttpServer())
        .post(`/conferences/1/bookings/verify?code=AESDFS`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toStrictEqual({
        message: 'Booking not found',
        statusCode: 404,
      });
    });

    it('should return HTTP 409 if the booking has already been verified', async () => {
      const booking = {
        firstName: 'Sinisa',
        lastName: 'Vuco',
        email: 'vuco@mail.com',
        entryCode: 'AVTMAT',
        verified: true,
        conferenceId: 1,
      };
      await insertBooking(dbConnection, booking);
      const response = await request(app.getHttpServer())
        .post(`/conferences/1/bookings/verify?code=${booking.entryCode}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(409);

      expect(response.body).toStrictEqual({
        message: 'This booking has already been verified',
        statusCode: 409,
      });

      await deleteBookingByEmail(dbConnection, booking.email);
    });
  });
});
