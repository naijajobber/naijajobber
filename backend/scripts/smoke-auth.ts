/**
 * Local smoke test for auth flow using mongodb-memory-server.
 * Usage: npx ts-node -r tsconfig-paths/register scripts/smoke-auth.ts
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { AppModule } from '../src/app.module';

async function main() {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('naijajobber');
  process.env.JWT_ACCESS_SECRET = 'naijajobber-dev-access-secret-change';
  process.env.JWT_REFRESH_SECRET = 'naijajobber-dev-refresh-secret-change';
  process.env.FRONTEND_URL = 'http://localhost:3000';
  process.env.REDIS_HOST = '127.0.0.1';
  process.env.NODE_ENV = 'test';

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
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

  const email = `seeker_${Date.now()}@example.com`;
  const password = 'SecurePass1!';

  const register = await request(server).post('/api/v1/auth/register').send({
    firstName: 'Ada',
    lastName: 'Okafor',
    email,
    password,
  });
  console.log('REGISTER', register.status, register.body.message);

  // Pull verification token from DB via raw mongoose is hard here;
  // re-register path already mailed token — read from user via internal update workaround:
  // For smoke: use admin seed login instead + register verify via forgot flow skip.
  // Capture token by logging from MailService is console — parse not available.
  // Directly hit Mongo through memory: verify by forging from repository via login after forced verify.

  const { Connection } = await import('mongoose');
  const conn = app.get('DatabaseConnection') as never;
  void conn;

  // Use mongoose model from Nest DI
  const { getModelToken } = await import('@nestjs/mongoose');
  const userModel = app.get(getModelToken('User'));
  const user = await userModel.findOne({ email });
  const token = user.emailVerificationToken as string;

  const verify = await request(server)
    .post('/api/v1/auth/verify-email')
    .send({ token });
  console.log('VERIFY', verify.status, verify.body.message);

  const login = await request(server)
    .post('/api/v1/auth/login')
    .send({ email, password });
  console.log('LOGIN', login.status, !!login.body?.data?.accessToken);

  const accessToken = login.body.data.accessToken as string;
  const refreshToken = login.body.data.refreshToken as string;

  const me = await request(server)
    .get('/api/v1/users/me')
    .set('Authorization', `Bearer ${accessToken}`);
  console.log('ME', me.status, me.body?.data?.email);

  const refresh = await request(server)
    .post('/api/v1/auth/refresh')
    .send({ refreshToken });
  console.log('REFRESH', refresh.status, !!refresh.body?.data?.accessToken);

  const logout = await request(server)
    .post('/api/v1/auth/logout')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ refreshToken });
  console.log('LOGOUT', logout.status, logout.body.message);

  const health = await request(server).get('/api/v1/health');
  console.log('HEALTH', health.status);

  await app.close();
  await mongod.stop();

  if (
    register.status !== 201 ||
    verify.status !== 200 ||
    login.status !== 200 ||
    me.status !== 200 ||
    refresh.status !== 200 ||
    logout.status !== 200
  ) {
    console.error('SMOKE FAILED');
    process.exit(1);
  }

  console.log('SMOKE PASSED');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
