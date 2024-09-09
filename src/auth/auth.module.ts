import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { TokensService } from '../tokens/tokens.service';

@Module({
  providers: [AuthService, UsersService, PrismaService, LocalStrategy, MailerService, TokensService],
  controllers: [AuthController]
})
export class AuthModule {}
