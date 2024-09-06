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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `config/.env.${process.env.NODE_ENV}`,
        "config/.env",
      ],
    cache: true,
    isGlobal: true,
  }),
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),
  }),
  UserModule, PrismaModule, AuthModule, MailerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}