/**
 * Phase 7 smoke: seeker profile + save job + alert prefs + google mock oauth
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';

async function main() {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('naijajobber');
  process.env.JWT_ACCESS_SECRET = 'naijajobber-dev-access-secret-change';
  process.env.JWT_REFRESH_SECRET = 'naijajobber-dev-refresh-secret-change';
  process.env.FRONTEND_URL = 'http://localhost:3000';
  process.env.REDIS_HOST = '127.0.0.1';
  process.env.AI_MODE = 'mock';
  process.env.PAYMENT_MODE = 'mock';
  process.env.SEED_ADMIN_EMAIL = 'admin@naijajobber.local';
  process.env.SEED_ADMIN_PASSWORD = 'Admin123!';
  process.env.NODE_ENV = 'test';

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  const server = app.getHttpServer();
  const userModel = app.get(getModelToken('User'));
  const stamp = Date.now();
  const password = 'SecurePass1!';
  const email = `prof_${stamp}@example.com`;

  await request(server).post('/api/v1/auth/register').send({
    firstName: 'Prof',
    lastName: 'Seeker',
    email,
    password,
    role: 'JOB_SEEKER',
  });
  const user = await userModel.findOne({ email });
  await request(server)
    .post('/api/v1/auth/verify-email')
    .send({ token: user.emailVerificationToken });
  const login = await request(server)
    .post('/api/v1/auth/login')
    .send({ email, password });
  const token = login.body.data.accessToken as string;
  const userId = login.body.data.user.id as string;

  const profile = await request(server)
    .patch('/api/v1/profiles/me')
    .set('Authorization', `Bearer ${token}`)
    .send({
      skills: ['NestJS', 'TypeScript'],
      visibility: 'PUBLIC',
      portfolioLinks: ['https://example.com'],
    });
  console.log('PROFILE', profile.status, profile.body.data?.skills?.length);

  const pdf = await request(server)
    .post('/api/v1/profiles/me/cv/generate')
    .set('Authorization', `Bearer ${token}`);
  console.log('CV', pdf.status, !!pdf.body.data?.cvPdfUrl);

  const pub = await request(server).get(`/api/v1/profiles/${userId}`);
  console.log('PUBLIC', pub.status, pub.body.data?.visibility);

  const alerts = await request(server)
    .patch('/api/v1/profiles/me/alerts')
    .set('Authorization', `Bearer ${token}`)
    .send({ enabled: true, keywords: ['remote'], frequency: 'weekly' });
  console.log('ALERTS', alerts.status, alerts.body.data?.enabled);

  // Save seeded featured job if any
  const jobs = await request(server).get('/api/v1/jobs').query({ limit: 1 });
  const jobId = jobs.body.data?.[0]?._id as string | undefined;
  let saveStatus = 200;
  if (jobId) {
    const save = await request(server)
      .post(`/api/v1/jobs/${jobId}/save`)
      .set('Authorization', `Bearer ${token}`);
    saveStatus = save.status;
    console.log('SAVE', save.status);
    const list = await request(server)
      .get('/api/v1/jobs/saved')
      .set('Authorization', `Bearer ${token}`);
    console.log('SAVED_LIST', list.status, list.body.data?.length);
  } else {
    console.log('SAVE skipped (no published jobs)');
  }

  const oauth = await request(server)
    .get('/api/v1/auth/google/callback')
    .query({ email: `g_${stamp}@gmail.com` });
  console.log('OAUTH', oauth.status, oauth.body.data?.mode);

  const health = await request(server).get('/api/v1/health');
  console.log('HEALTH', health.status);

  await app.close();
  await mongod.stop();

  const ok =
    profile.status === 200 &&
    profile.body.data?.visibility === 'PUBLIC' &&
    pdf.status === 201 &&
    !!pdf.body.data?.cvPdfUrl &&
    pub.status === 200 &&
    alerts.status === 200 &&
    alerts.body.data?.enabled === true &&
    (saveStatus === 201 || saveStatus === 200) &&
    oauth.status === 200 &&
    oauth.body.data?.accessToken &&
    health.status === 200;

  if (!ok) {
    console.error('SMOKE PROFILE FAILED');
    process.exit(1);
  }
  console.log('SMOKE PROFILE PASSED');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
