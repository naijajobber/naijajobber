export const EMAIL_QUEUE = 'email';
export const ALERTS_QUEUE = 'alerts';

export type EmailJobPayload = {
  to: string;
  subject: string;
  html: string;
};

export type AlertsJobPayload = {
  type: 'DIGEST';
};

