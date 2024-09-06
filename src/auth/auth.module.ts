import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  providers: [AuthService, UsersService, PrismaService, LocalStrategy, MailerService],
  controllers: [AuthController]
})
export class AuthModule {}
