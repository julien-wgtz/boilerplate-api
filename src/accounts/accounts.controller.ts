import {
  Body,
  Controller,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccountService } from './accounts.service';
import { AuthenticatedGuard } from '../auth/auth.guard';
import { MediaHandlerService } from '../media-handler/media-handler.service';
import { Multer } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly mediaHandlerService: MediaHandlerService,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Post('current')
  async current(@Request() req) {
    return this.accountService.current(
      req.session.user.currentAccountId,
      req.session.user.id,
    );
  }

  @UseGuards(AuthenticatedGuard)
  @Post('create')
  async create(@Request() req, @Body() body) {
    return this.accountService.create(body.name, req.session.user.id);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('delete')
  async delete(@Request() req, @Body() body) {
    return this.accountService.delete(body.accountId, req.session.user.id);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('leave')
  async leave(@Request() req, @Body() body) {
    return this.accountService.leave(body.accountId, req.session.user.id);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('invite-user')
  async inviteUser(@Body() body, @Request() req) {
    return this.accountService.inviteUser(
      body.userInvited,
      body.accountId,
      req.session.user.email,
    );
  }

  @UseGuards(AuthenticatedGuard)
  @Post('accept-invite')
  async acceptInvite(@Body() body, @Request() req) {
    return this.accountService.acceptInvite(
      body.accountId,
      req.session.user.id,
    );
  }

  @UseGuards(AuthenticatedGuard)
  @Post('refuse-invite')
  async refuseInvite(@Body() body, @Request() req) {
    return this.accountService.refuseInvite(
      body.accountId,
      req.session.user.id,
    );
  }

  @UseGuards(AuthenticatedGuard)
  @Post('leave-invite')
  async leaveInviteAccount(@Body() body, @Request() req) {
    return this.accountService.leaveAccount(
      body.accountId,
      body.userId,
      req.session.user.id,
    );
  }

  @UseGuards(AuthenticatedGuard)
  @Post('update-role')
  async updateRole(@Body() body, @Request() req) {
    return this.accountService.updateRole(
      body.accountId,
      body.userId,
      body.role,
      req.session.user.id,
    );
  }

  @UseGuards(AuthenticatedGuard)
  @Post('change-name')
  async changeName(@Body() body, @Request() req) {
    return this.accountService.changeName(
      body.accountId,
      body.name,
      req.session.user.id,
    );
  }

  @UseGuards(AuthenticatedGuard)
  @Post('update-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Limite : 10 Mo
    }),
  )
  async updateAvatar(
    @Request() req,
    @UploadedFile() file: Multer.File,
    @Body() body,
  ) {
    const mediaCompressed = await this.mediaHandlerService.compressMediaByType(
      file.buffer,
      90,
      250,
      file.mimetype,
    );

    const avatarUrl = await this.mediaHandlerService.uploadMedia(
      mediaCompressed,
      file.originalname,
      `accounts/${body.accountId}/avatars`,
      file.mimetype,
    );
    return this.accountService.updateAvatar(
      req.session.user.email,
      parseInt(body.accountId),
      avatarUrl,
    );
  }
}
