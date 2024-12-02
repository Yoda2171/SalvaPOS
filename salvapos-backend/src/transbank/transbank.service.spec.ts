import { Test, TestingModule } from '@nestjs/testing';
import { TransbankService } from './transbank.service';

describe('TransbankService', () => {
  let service: TransbankService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransbankService],
    }).compile();

    service = module.get<TransbankService>(TransbankService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
