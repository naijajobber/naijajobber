import { Injectable } from '@nestjs/common';

export interface SmsProvider {
  send(to: string, body: string): Promise<{ ok: boolean; message: string }>;
}

export interface PushProvider {
  send(
    userId: string,
    title: string,
    body: string,
  ): Promise<{ ok: boolean; message: string }>;
}

@Injectable()
export class NoopSmsProvider implements SmsProvider {
  async send(
    _to: string,
    _body: string,
  ): Promise<{ ok: boolean; message: string }> {
    return { ok: false, message: 'SMS provider not configured' };
  }
}

@Injectable()
export class NoopPushProvider implements PushProvider {
  async send(
    _userId: string,
    _title: string,
    _body: string,
  ): Promise<{ ok: boolean; message: string }> {
    return { ok: false, message: 'Push provider not configured' };
  }
}
