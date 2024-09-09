import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokensController } from './tokens.controller';

@Module({
  providers: [TokensService, PrismaService],
  controllers: [TokensController]
})
export class TokensModule {}
