import { Test, TestingModule } from '@nestjs/testing';
import { MediaHandlerController } from './media-handler.controller';

describe('MediaHandlerController', () => {
  let controller: MediaHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaHandlerController],
    }).compile();

    controller = module.get<MediaHandlerController>(MediaHandlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
