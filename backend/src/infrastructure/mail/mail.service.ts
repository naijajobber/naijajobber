import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('mail.host');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('mail.port'),
        auth: {
          user: this.config.get<string>('mail.user'),
          pass: this.config.get<string>('mail.pass'),
        },
      });
    }
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const from = this.config.get<string>('mail.from');

    if (!this.transporter) {
      this.logger.log(
        `[DEV MAIL] To: ${options.to} | Subject: ${options.subject}\n${options.html}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.config.get<string>('frontendUrl');
    const link = `${frontendUrl}/verify-email?token=${token}`;
    await this.sendMail({
      to: email,
      subject: 'Verify your NaijaJobber account',
      html: `<p>Welcome to NaijaJobber.</p><p><a href="${link}">Verify your email</a></p><p>Or use token: <code>${token}</code></p>`,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.config.get<string>('frontendUrl');
    const link = `${frontendUrl}/reset-password?token=${token}`;
    await this.sendMail({
      to: email,
      subject: 'Reset your NaijaJobber password',
      html: `<p>Reset your password:</p><p><a href="${link}">Reset password</a></p><p>Or use token: <code>${token}</code></p>`,
    });
  }
}
