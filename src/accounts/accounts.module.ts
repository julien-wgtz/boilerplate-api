import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountService } from './accounts.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { MediaHandlerService } from '../media-handler/media-handler.service';

@Module({
  imports: [NotificationsModule],
  providers: [
    AccountService,
    PrismaService,
    NotificationsService,
    MediaHandlerService,
  ],
  controllers: [],
})
export class AccountModule {}
