import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TokensModule } from './tokens/tokens.module';
import { AccountController } from './accounts/accounts.controller';
import { AccountService } from './accounts/accounts.service';
import { AccountModule } from './accounts/accounts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MediaHandlerController } from './media-handler/media-handler.controller';
import { MediaHandlerService } from './media-handler/media-handler.service';
import { MediaHandlerModule } from './media-handler/media-handler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`config/.env.${process.env.NODE_ENV}`, 'config/.env'],
      cache: true,
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    UserModule,
    PrismaModule,
    AuthModule,
    MailerModule,
    TokensModule,
    AccountModule,
    NotificationsModule,
    MediaHandlerModule,
  ],
  controllers: [AppController, AccountController, MediaHandlerController],
  providers: [AppService, AccountService, MediaHandlerService],
})
export class AppModule {}
