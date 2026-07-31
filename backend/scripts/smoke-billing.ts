/**
 * Phase 4 smoke: mock checkout → subscription + invoice
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
  const email = `bill_${stamp}@example.com`;

  await request(server).post('/api/v1/auth/register').send({
    firstName: 'Bill',
    lastName: 'Employer',
    email,
    password,
    role: 'EMPLOYER',
  });
  const user = await userModel.findOne({ email });
  await request(server)
    .post('/api/v1/auth/verify-email')
    .send({ token: user.emailVerificationToken });
  const login = await request(server)
    .post('/api/v1/auth/login')
    .send({ email, password });
  const token = login.body.data.accessToken as string;

  await request(server)
    .post('/api/v1/companies')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Bill Co ${stamp}`,
      description: 'Billing smoke company profile goes here.',
    });

  const plans = await request(server).get('/api/v1/billing/plans');
  console.log('PLANS', plans.status, plans.body.data?.length);

  const checkout = await request(server)
    .post('/api/v1/billing/checkout')
    .set('Authorization', `Bearer ${token}`)
    .send({ purpose: 'SUBSCRIPTION', planCode: 'EMPLOYER_PRO', provider: 'mock' });
  console.log('CHECKOUT', checkout.status, checkout.body.data?.reference);

  const sub = await request(server)
    .get('/api/v1/billing/subscriptions/mine')
    .set('Authorization', `Bearer ${token}`);
  console.log('SUB', sub.status, sub.body.data?.planCode);

  const invoices = await request(server)
    .get('/api/v1/billing/invoices')
    .set('Authorization', `Bearer ${token}`);
  console.log('INVOICES', invoices.status, invoices.body.data?.length);

  const job = await request(server)
    .post('/api/v1/jobs')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Featured Role Test',
      description: 'Testing featured job entitlement after pro subscription.',
      isFeatured: true,
    });
  const jobId = job.body.data._id as string;

  // company not verified — publish may fail; verify via admin
  const adminLogin = await request(server).post('/api/v1/auth/login').send({
    email: 'admin@naijajobber.local',
    password: 'Admin123!',
  });
  const employer = await request(server)
    .get('/api/v1/employers/me')
    .set('Authorization', `Bearer ${token}`);
  const companyId = employer.body.data.companyId as string;
  await request(server)
    .post(`/api/v1/companies/${companyId}/verify`)
    .set('Authorization', `Bearer ${adminLogin.body.data.accessToken}`);

  const publish = await request(server)
    .post(`/api/v1/jobs/${jobId}/publish`)
    .set('Authorization', `Bearer ${token}`);
  console.log('PUBLISH_FEATURED', publish.status);

  await app.close();
  await mongod.stop();

  const ok =
    plans.status === 200 &&
    checkout.status === 201 &&
    sub.status === 200 &&
    sub.body.data?.planCode === 'EMPLOYER_PRO' &&
    (invoices.body.data?.length || 0) >= 1 &&
    publish.status === 201;

  if (!ok) {
    console.error('SMOKE BILLING FAILED');
    process.exit(1);
  }
  console.log('SMOKE BILLING PASSED');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
