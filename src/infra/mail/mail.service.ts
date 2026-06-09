/**
 * File: src/infra/mail/mail.service.ts
 * Purpose: Nodemailer-based email service for signup, forgot- and reset-password flows.
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { signupTemplate } from './templates/signup.template.js';
import { forgotPasswordTemplate } from './templates/forgot-password.template.js';
import { resetPasswordTemplate } from './templates/reset-password.template.js';

@Injectable()
export class MailService {
   private readonly transporter: Transporter;
   private readonly logger = new Logger(MailService.name);
   private readonly from: string;
   private readonly appUrl: string;

   constructor(private readonly config: ConfigService) {
      this.from = this.config.get<string>('MAIL_FROM', 'noreply@example.com');
      this.appUrl = this.config.get<string>('CLIENT_URL', 'http://localhost:3000');

      this.transporter = nodemailer.createTransport({
         host: this.config.get<string>('MAIL_HOST'),
         port: this.config.get<number>('MAIL_PORT', 587),
         secure: this.config.get<number>('MAIL_PORT', 587) === 465,
         auth: {
            user: this.config.get<string>('MAIL_USER'),
            pass: this.config.get<string>('MAIL_PASS'),
         },
      });
   }

   async sendSignupEmail(to: string, firstName: string): Promise<void> {
      try {
         await this.transporter.sendMail({
            from: this.from,
            to,
            subject: 'Welcome to our platform!',
            html: signupTemplate(firstName, this.appUrl),
         });
      } catch (err) {
         this.logger.error(`Failed to send signup email to ${to}`, err);
      }
   }

   async sendForgotPasswordEmail(to: string, firstName: string, token: string): Promise<void> {
      const resetUrl = `${this.appUrl}/reset-password?token=${token}`;
      try {
         await this.transporter.sendMail({
            from: this.from,
            to,
            subject: 'Reset Your Password',
            html: forgotPasswordTemplate(firstName, resetUrl),
         });
      } catch (err) {
         this.logger.error(`Failed to send forgot-password email to ${to}`, err);
      }
   }

   async sendResetPasswordEmail(to: string, firstName: string): Promise<void> {
      try {
         await this.transporter.sendMail({
            from: this.from,
            to,
            subject: 'Your password has been reset',
            html: resetPasswordTemplate(firstName, this.appUrl),
         });
      } catch (err) {
         this.logger.error(`Failed to send reset-password confirmation to ${to}`, err);
      }
   }
}
