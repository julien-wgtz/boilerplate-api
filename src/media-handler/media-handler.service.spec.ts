import { Test, TestingModule } from '@nestjs/testing';
import { MediaHandlerService } from './media-handler.service';

describe('MediaHandlerService', () => {
  let service: MediaHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaHandlerService],
    }).compile();

    service = module.get<MediaHandlerService>(MediaHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
