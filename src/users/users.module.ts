import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerService } from '../mailer/mailer.service';
import { TokensService } from '../tokens/tokens.service';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, MailerService, TokensService],
  controllers: [UserController]
})
export class UserModule {}
