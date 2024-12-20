import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   *
   * @param body
   * @returns {status : 200 | 400, message : string}
   * Get user notification
   */
  @UseGuards(AuthenticatedGuard)
  @Post('get-notification-user')
  async getNotificationUser(@Request() req) {
    return this.notificationsService.getNotificationUser(req.session.user.id);
  }

  /**
   *
   * @param body
   * @returns {status : 200 | 400, message : string}
   * Read notification
   */
  @UseGuards(AuthenticatedGuard)
  @Post('seen-notification')
  async seenNotification(@Body() body) {
    return this.notificationsService.seenNotification(body.notificationId);
  }

  /**
   *
   * @param body
   * @returns {status : 200 | 400, message : string}
   * set notification as read
   */
  @UseGuards(AuthenticatedGuard)
  @Post('read-notification')
  async readNotification(@Body() body) {
    return this.notificationsService.readNotification(body.notificationId);
  }
}
