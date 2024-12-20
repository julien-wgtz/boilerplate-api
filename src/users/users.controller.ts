import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Request,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from '../auth/auth.guard';
import { Response } from 'express';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notifications.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { MediaHandlerService } from '../media-handler/media-handler.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly mediaHandlerService: MediaHandlerService,
  ) {}

  /**
   *
   * @param req
   * @returns
   * info about the user
   */
  @UseGuards(AuthenticatedGuard)
  @Post('me')
  async me(@Request() req) {
    const user = await this.userService.findByEmailWithAccount(
      req.session.user.email,
    );
    req.session.user = user;
    req.session.save();
    return user;
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
    return this.userService.changePassword(
      body.password,
      body.lastPassword,
      req.session.user.email,
    );
  }

  /**
   *
   * @param body
   * @returns {status : 200 | 400, message : string}
   *  Change email
   */
  @UseGuards(AuthenticatedGuard)
  @Post('ask-change-email')
  async askChangeEmail(@Body() body, @Request() req) {
    return this.userService.askChangeEmail(req.session.user.email, body.email);
  }

  /**
   *
   * @param body
   * @returns {status : 200 | 400, message : string}
   *  Change email
   */
  @Post('change-email')
  async changeEmail(@Request() req, @Body() body) {
    return this.userService.changeEmail(req, body.token);
  }

  /**
   *
   * @param body
   * @returns {status : 200 | 400, message : string}
   * Update user's theme
   */

  @UseGuards(AuthenticatedGuard)
  @Post('change-theme')
  async updateTheme(@Request() req, @Body() body) {
    return this.userService.updateTheme(req.session.user.email, body.theme);
  }

  /**
   *
   * @param body
   * @returns {status : 200 | 400, message : string}
   * get all accounts of a user
   */
  @UseGuards(AuthenticatedGuard)
  @Post('accounts')
  async accounts(@Request() req) {
    return this.userService.accounts(req.session.user.email);
  }

  /**
   *
   * @param body
   * @returns {status : 200 | 400, message : string}
   * delete an user and account associated
   */
  @UseGuards(AuthenticatedGuard)
  @Post('delete-user')
  async deleteUser(@Request() req, @Res() res: Response) {
    const email = req.session.user.email;

    try {
      const result = await this.userService.deleteUser(email);

      req.session.destroy((err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: 'Erreur lors de la déconnexion' });
        }
        res.clearCookie('connect.sid', {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
        });
        return res.status(result.status).json({ message: result.message });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'utilisateur" });
    }
  }

  /**
   *
   * @param body
   * @returns {status : 200 | 400, message : string}
   * update current Account
   */
  @UseGuards(AuthenticatedGuard)
  @Post('change-current-account')
  async changeCurrentAccount(@Request() req, @Body() body) {
    return this.userService.changeCurrentAccount(
      req.session.user.email,
      body.accountId,
    );
  }

  /**
   *
   * @param body
   * @returns {status : 200 | 400, message : string}
   * Change user's name
   */

  @UseGuards(AuthenticatedGuard)
  @Post('change-name')
  async changeName(@Request() req, @Body() body) {
    return this.userService.changeName(req.session.user.email, body.name);
  }

  /**
   *
   * @param body
   * @returns {status : 200 | 400, message : string}
   * Change user's avatar
   *
   */

  @UseGuards(AuthenticatedGuard)
  @Post('update-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Limite : 10 Mo
    }),
  )
  async updateAvatar(@Request() req, @UploadedFile() file: Multer.File) {
    const mediaCompressed = await this.mediaHandlerService.compressMediaByType(
      file.buffer,
      90,
      250,
      file.mimetype,
    );

    const avatarUrl = await this.mediaHandlerService.uploadMedia(
      mediaCompressed,
      file.originalname,
      `users/${req.session.user.id}/avatars`,
      file.mimetype,
    );
    return this.userService.updateAvatar(req.session.user.email, avatarUrl);
  }
}
