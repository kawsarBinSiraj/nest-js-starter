/**
 * File: src/infra/mail/mail.module.ts
 * Purpose: Provides MailService for sending transactional emails.
 */
import { Module } from '@nestjs/common';
import { MailService } from './mail.service.js';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
