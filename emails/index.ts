import { Res } from '@nestjs/common';
import ConfirmationSignin from './confirmation-signin';
import ResendVerification from './resend-verification';
import ResetPassword from './reset-password';

const EmailTemplates = {
  ConfirmationSignin: ConfirmationSignin,
  ResendVerification: ResendVerification,
  ResetPassword: ResetPassword,
};

export default EmailTemplates;