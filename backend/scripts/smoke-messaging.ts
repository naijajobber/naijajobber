/**
 * Phase 3 smoke: apply → conversation → message → notification
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

  async function registerAndLogin(
    email: string,
    role: 'EMPLOYER' | 'JOB_SEEKER',
    firstName: string,
  ) {
    await request(server).post('/api/v1/auth/register').send({
      firstName,
      lastName: 'Test',
      email,
      password,
      role,
    });
    const user = await userModel.findOne({ email });
    await request(server)
      .post('/api/v1/auth/verify-email')
      .send({ token: user.emailVerificationToken });
    const login = await request(server)
      .post('/api/v1/auth/login')
      .send({ email, password });
    return login.body.data.accessToken as string;
  }

  const employerToken = await registerAndLogin(
    `emp_msg_${stamp}@example.com`,
    'EMPLOYER',
    'Em',
  );
  const company = await request(server)
    .post('/api/v1/companies')
    .set('Authorization', `Bearer ${employerToken}`)
    .send({
      name: `Msg Co ${stamp}`,
      description: 'Company for messaging smoke test flow.',
    });
  const companyId = company.body.data._id as string;

  const adminLogin = await request(server).post('/api/v1/auth/login').send({
    email: 'admin@naijajobber.local',
    password: 'Admin123!',
  });
  await request(server)
    .post(`/api/v1/companies/${companyId}/verify`)
    .set('Authorization', `Bearer ${adminLogin.body.data.accessToken}`);

  const job = await request(server)
    .post('/api/v1/jobs')
    .set('Authorization', `Bearer ${employerToken}`)
    .send({
      title: 'Messaging QA Engineer',
      description:
        'Validate chat and notification flows for remote African hiring.',
    });
  const jobId = job.body.data._id as string;
  await request(server)
    .post(`/api/v1/jobs/${jobId}/publish`)
    .set('Authorization', `Bearer ${employerToken}`);

  const seekerToken = await registerAndLogin(
    `seek_msg_${stamp}@example.com`,
    'JOB_SEEKER',
    'Se',
  );
  const apply = await request(server)
    .post('/api/v1/applications')
    .set('Authorization', `Bearer ${seekerToken}`)
    .send({ jobId, coverLetter: 'Hello from seeker' });
  console.log('APPLY', apply.status);
  const applicationId = apply.body.data._id as string;

  const conv = await request(server)
    .post('/api/v1/conversations')
    .set('Authorization', `Bearer ${employerToken}`)
    .send({ applicationId });
  console.log('CONV', conv.status);
  const conversationId = conv.body.data._id as string;

  const msg = await request(server)
    .post(`/api/v1/conversations/${conversationId}/messages`)
    .set('Authorization', `Bearer ${employerToken}`)
    .send({ body: 'Thanks for applying — can we chat?' });
  console.log('MSG', msg.status);

  const notifs = await request(server)
    .get('/api/v1/notifications')
    .set('Authorization', `Bearer ${seekerToken}`);
  console.log('NOTIFS', notifs.status, notifs.body.data?.length);

  await app.close();
  await mongod.stop();

  const ok =
    apply.status === 201 &&
    conv.status === 201 &&
    msg.status === 201 &&
    notifs.status === 200 &&
    (notifs.body.data?.length || 0) >= 1;

  if (!ok) {
    console.error('SMOKE MESSAGING FAILED');
    process.exit(1);
  }
  console.log('SMOKE MESSAGING PASSED');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
