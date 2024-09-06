import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';

@Module({
  providers: [AuthService, UsersService, PrismaService, LocalStrategy, MailerService],
  controllers: [AuthController]
})
export class AuthModule {}
