import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import EmailTemplates from '../../emails';
import { Resend } from 'resend';
import i18n from '../../i18n.js';

@Injectable()
export class MailerService {
  private mailer: Resend;

  constructor(private readonly configService: ConfigService) {
    this.mailer = new Resend(configService.get('MAILER_API_KEY'));
  }

  async sendEmail(to: string, subject: string, template?: any, data?: any, lang: string = "en") {
    if (!EmailTemplates[template]) {
      throw new Error('Invalid email template specified');
    }
    i18n.changeLanguage(lang);
    const templateFunction = EmailTemplates[template];
    const mail = await this.mailer.emails.send({
      from: `Nexus <${this.configService.get('MAILER_MAIL_ADDRESS')}>`,
      to,
      subject,
      react: templateFunction(data),
    });
  }
}