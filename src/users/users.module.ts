import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerService } from '../mailer/mailer.service';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, MailerService],
  controllers: [UserController]
})
export class UserModule {}
