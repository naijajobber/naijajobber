/**
 * Phase 6 smoke: seed admin → overview → verify company
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
  process.env.AI_MODE = 'mock';
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

  await request(server).post('/api/v1/auth/register').send({
    firstName: 'Emp',
    lastName: 'AdminSmoke',
    email: `adm_emp_${stamp}@example.com`,
    password,
    role: 'EMPLOYER',
  });
  const emp = await userModel.findOne({ email: `adm_emp_${stamp}@example.com` });
  await request(server)
    .post('/api/v1/auth/verify-email')
    .send({ token: emp.emailVerificationToken });
  const empLogin = await request(server)
    .post('/api/v1/auth/login')
    .send({ email: `adm_emp_${stamp}@example.com`, password });
  const empToken = empLogin.body.data.accessToken as string;

  await request(server)
    .post('/api/v1/companies')
    .set('Authorization', `Bearer ${empToken}`)
    .send({
      name: `Pending Co ${stamp}`,
      description: 'Company waiting for admin verification in smoke test.',
    });

  const adminLogin = await request(server).post('/api/v1/auth/login').send({
    email: 'admin@naijajobber.local',
    password: 'Admin123!',
  });
  const adminToken = adminLogin.body.data.accessToken as string;

  const before = await request(server)
    .get('/api/v1/admin/overview')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log('OVERVIEW', before.status, before.body.data?.companies?.pending);

  const pending = await request(server)
    .get('/api/v1/admin/companies')
    .query({ status: 'PENDING' })
    .set('Authorization', `Bearer ${adminToken}`);
  const companyId = pending.body.data?.[0]?._id as string;
  console.log('PENDING', pending.status, companyId);

  const verify = await request(server)
    .post(`/api/v1/admin/companies/${companyId}/verify`)
    .set('Authorization', `Bearer ${adminToken}`);
  console.log('VERIFY', verify.status, verify.body.data?.verificationStatus);

  const after = await request(server)
    .get('/api/v1/admin/overview')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log('AFTER_PENDING', after.body.data?.companies?.pending);

  const denied = await request(server)
    .get('/api/v1/admin/overview')
    .set('Authorization', `Bearer ${empToken}`);
  console.log('DENIED', denied.status);

  await app.close();
  await mongod.stop();

  const ok =
    before.status === 200 &&
    pending.status === 200 &&
    !!companyId &&
    verify.status === 201 &&
    verify.body.data?.verificationStatus === 'VERIFIED' &&
    (after.body.data?.companies?.pending ?? 99) <
      (before.body.data?.companies?.pending ?? 0) &&
    denied.status === 403;

  if (!ok) {
    console.error('SMOKE ADMIN FAILED');
    process.exit(1);
  }
  console.log('SMOKE ADMIN PASSED');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
