import { Res } from '@nestjs/common';
import ConfirmationSignin from './confirmation-signin';
import ResendVerification from './resend-verification';
import ResetPassword from './reset-password';
import ChangeEmail from './change-email';

const EmailTemplates = {
  ConfirmationSignin: ConfirmationSignin,
  ResendVerification: ResendVerification,
  ResetPassword: ResetPassword,
  ChangeEmail: ChangeEmail,
};

export default EmailTemplates;