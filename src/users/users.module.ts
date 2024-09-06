import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, MailerService],
  controllers: [UserController]
})
export class UserModule {}
