/**
 * Phase 2 smoke: employer company → verify → publish job → seeker apply
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

  const stamp = Date.now();
  const employerEmail = `employer_${stamp}@example.com`;
  const seekerEmail = `seeker_${stamp}@example.com`;
  const password = 'SecurePass1!';

  const userModel = app.get(getModelToken('User'));

  async function registerAndVerify(
    email: string,
    role: 'EMPLOYER' | 'JOB_SEEKER',
    firstName: string,
  ) {
    const reg = await request(server).post('/api/v1/auth/register').send({
      firstName,
      lastName: 'Test',
      email,
      password,
      role,
    });
    if (reg.status !== 201) throw new Error(`register failed ${reg.status}`);
    const user = await userModel.findOne({ email });
    const token = user.emailVerificationToken as string;
    const verify = await request(server)
      .post('/api/v1/auth/verify-email')
      .send({ token });
    if (verify.status !== 200) throw new Error('verify failed');
    const login = await request(server)
      .post('/api/v1/auth/login')
      .send({ email, password });
    if (login.status !== 200) throw new Error('login failed');
    return login.body.data.accessToken as string;
  }

  const employerToken = await registerAndVerify(
    employerEmail,
    'EMPLOYER',
    'Em',
  );
  console.log('EMPLOYER_OK');

  const companyRes = await request(server)
    .post('/api/v1/companies')
    .set('Authorization', `Bearer ${employerToken}`)
    .send({
      name: `Acme ${stamp}`,
      website: 'https://acme.example',
      description: 'A test company for NaijaJobber Phase 2 smoke.',
      industry: 'Technology',
    });
  console.log('COMPANY', companyRes.status);
  const companyId = companyRes.body.data._id as string;

  const adminLogin = await request(server).post('/api/v1/auth/login').send({
    email: 'admin@naijajobber.local',
    password: 'Admin123!',
  });
  console.log('ADMIN_LOGIN', adminLogin.status);
  const adminToken = adminLogin.body.data.accessToken as string;

  const verifyCompany = await request(server)
    .post(`/api/v1/companies/${companyId}/verify`)
    .set('Authorization', `Bearer ${adminToken}`);
  console.log('VERIFY_COMPANY', verifyCompany.status);

  const jobRes = await request(server)
    .post('/api/v1/jobs')
    .set('Authorization', `Bearer ${employerToken}`)
    .send({
      title: 'Staff Engineer',
      description:
        'Lead remote engineering for African-first products. NestJS preferred.',
      employmentType: 'FULL_TIME',
      workplaceType: 'REMOTE',
      skills: ['NestJS', 'TypeScript'],
      category: 'Software Engineering',
      salaryMin: 90000,
      salaryMax: 130000,
      isFeatured: true,
    });
  console.log('JOB_CREATE', jobRes.status);
  const jobId = jobRes.body.data._id as string;
  const jobSlug = jobRes.body.data.slug as string;

  const publish = await request(server)
    .post(`/api/v1/jobs/${jobId}/publish`)
    .set('Authorization', `Bearer ${employerToken}`);
  console.log('PUBLISH', publish.status);

  const list = await request(server).get('/api/v1/jobs?limit=5');
  console.log('JOBS_LIST', list.status, list.body.meta?.total);

  const bySlug = await request(server).get(`/api/v1/jobs/slug/${jobSlug}`);
  console.log('JOB_SLUG', bySlug.status);

  const seekerToken = await registerAndVerify(seekerEmail, 'JOB_SEEKER', 'Se');
  console.log('SEEKER_OK');

  const apply = await request(server)
    .post('/api/v1/applications')
    .set('Authorization', `Bearer ${seekerToken}`)
    .send({
      jobId,
      coverLetter: 'I would love to join your remote team.',
    });
  console.log('APPLY', apply.status);

  const apps = await request(server)
    .get(`/api/v1/jobs/${jobId}/applications`)
    .set('Authorization', `Bearer ${employerToken}`);
  console.log('APPS', apps.status, apps.body.data?.length);

  await app.close();
  await mongod.stop();

  const ok =
    companyRes.status === 201 &&
    verifyCompany.status === 201 &&
    jobRes.status === 201 &&
    publish.status === 201 &&
    list.status === 200 &&
    apply.status === 201 &&
    apps.status === 200 &&
    (apps.body.data?.length || 0) >= 1;

  if (!ok) {
    console.error('SMOKE JOBS FAILED');
    process.exit(1);
  }
  console.log('SMOKE JOBS PASSED');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
