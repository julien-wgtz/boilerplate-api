import { Controller, Post, Body, UseGuards, Req, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from '../auth/auth.guard';


@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  /**
   * 
   * @param req 
   * @returns 
   * info about the user
   */
  @UseGuards(AuthenticatedGuard)
  @Post('me')
  async me(@Request() req) {
    return this.userService.findByEmail(req.session.user.email);
  }

  /**
   * 
   * @param body 
   * @returns {status : 200 | 400, message : string}
   *  Verify user email
   */
  @Post('verification-email')
  async verificationEmail(@Body() body) {
    return this.userService.verificationEmail(body.token, body.type);
  }

  /**
   * 
   * @param body 
   * @returns {status : 200 | 400, message : string}
   *  Resend verification email
   */
  @Post('resend-verification')
  async resendVerification(@Body() body) {
    return this.userService.resendVerification(body.email);
  }

  /**
   * 
   * @param body 
   * @returns {status : 200 | 400, message : string}
   *  Reset password
   */
  @Post('reset-password')
  async resetPassword(@Body() body) {
    return this.userService.resetPassword(body.email);
  }

  /**
   * 
   * @param body 
   * @returns {status : 200 | 400, message : string}
   *  Change password
   */
  @Post('change-password-token')
  async changePasswordToken(@Body() body) {
    return this.userService.changePasswordToken(body.password, body.token);
  }

  /**
   * 
   * @param body 
   * @returns {status : 200 | 400, message : string}
   *  Change password
   */
  @UseGuards(AuthenticatedGuard)
  @Post('change-password')
  async changePassword(@Body() body, @Request() req) {
    return this.userService.changePassword(body.password, body.lastPassword, req.session.user.email);
  }

  /**
   * 
   * @param body 
   * @returns {status : 200 | 400, message : string}
   *  Change email
   */
  @UseGuards(AuthenticatedGuard)
  @Post('change-email')
  async changeEmail(@Body() body, @Request() req) {
    return this.userService.changeEmail(req.session.user.email, body.email);
  }
}