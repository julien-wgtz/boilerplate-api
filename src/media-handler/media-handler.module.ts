import { Module } from '@nestjs/common';
import { MediaHandlerController } from './media-handler.controller';
import { MediaHandlerService } from './media-handler.service';

@Module({
  providers: [MediaHandlerService],
  controllers: [MediaHandlerController],
})
export class MediaHandlerModule {}
