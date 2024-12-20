import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerService } from '../mailer/mailer.service';
import { TokensService } from '../tokens/tokens.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { MediaHandlerModule } from '../media-handler/media-handler.module';
import { MediaHandlerService } from '../media-handler/media-handler.service';

@Module({
  imports: [PrismaModule, NotificationsModule, MediaHandlerModule],
  providers: [UsersService, MailerService, TokensService, MediaHandlerService],
  controllers: [UserController],
})
export class UserModule {}
