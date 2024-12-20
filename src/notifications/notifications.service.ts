import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from './notifications.types';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly prismaService: PrismaService,
  ) {}

  async createNotification(data: any, userId: number, type: NotificationType) {
    const notif = await this.prismaService.notification.create({
      data: {
        userId: userId,
        type: type,
        data,
      },
    });

    this.notificationsGateway.sendNotificationToUser(
      userId.toLocaleString(),
      notif,
    );
  }
  2;

  async getNotificationUser(userId: number) {
    return this.prismaService.notification.findMany({
      where: {
        userId,
        read: false,
      },
    });
  }

  async seenNotification(notificationId: number) {
    return this.prismaService.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        seen: true,
      },
    });
  }

  async readNotification(notificationId: number) {
    return this.prismaService.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });
  }
}
