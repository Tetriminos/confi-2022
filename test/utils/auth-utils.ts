import * as request from 'supertest';

export const getAccessToken = async (app) => {
  const response = await request(app.getHttpServer())
    .post('/admin/login')
    .send({ username: 'admin', password: 'e2e' });

  return response.body.access_token;
};
