/**
 * Phase 5 smoke: seeker → resume review → cover letter → job match
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
  const seekerEmail = `ai_seeker_${stamp}@example.com`;

  await request(server).post('/api/v1/auth/register').send({
    firstName: 'Ada',
    lastName: 'Seeker',
    email: seekerEmail,
    password,
    role: 'JOB_SEEKER',
  });
  const seeker = await userModel.findOne({ email: seekerEmail });
  await request(server)
    .post('/api/v1/auth/verify-email')
    .send({ token: seeker.emailVerificationToken });
  const login = await request(server)
    .post('/api/v1/auth/login')
    .send({ email: seekerEmail, password });
  const token = login.body.data.accessToken as string;

  const review = await request(server)
    .post('/api/v1/ai/resume/review')
    .set('Authorization', `Bearer ${token}`)
    .send({
      resumeText:
        'Remote software engineer with 5 years building APIs across Africa. Led a team of 4. Delivered payment integrations used by 20k users.',
    });
  console.log('REVIEW', review.status, review.body.data?.score);

  const cover = await request(server)
    .post('/api/v1/ai/cover-letter')
    .set('Authorization', `Bearer ${token}`)
    .send({
      jobDescription:
        'We need a NestJS backend engineer for a remote African SaaS. Strong MongoDB and TypeScript required.',
    });
  console.log('COVER', cover.status, !!cover.body.data?.letter);

  const match = await request(server)
    .post('/api/v1/ai/match')
    .set('Authorization', `Bearer ${token}`)
    .send({ limit: 5 });
  console.log('MATCH', match.status, match.body.data?.matches?.length);

  const runs = await request(server)
    .get('/api/v1/ai/runs')
    .set('Authorization', `Bearer ${token}`);
  console.log('RUNS', runs.status, runs.body.data?.length);

  await app.close();
  await mongod.stop();

  const ok =
    review.status === 201 &&
    typeof review.body.data?.score === 'number' &&
    cover.status === 201 &&
    !!cover.body.data?.letter &&
    match.status === 201 &&
    Array.isArray(match.body.data?.matches) &&
    runs.status === 200 &&
    (runs.body.data?.length || 0) >= 3;

  if (!ok) {
    console.error('SMOKE AI FAILED');
    process.exit(1);
  }
  console.log('SMOKE AI PASSED');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
