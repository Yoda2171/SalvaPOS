import { Test, TestingModule } from '@nestjs/testing';
import { TransbankController } from './transbank.controller';

describe('TransbankController', () => {
  let controller: TransbankController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransbankController],
    }).compile();

    controller = module.get<TransbankController>(TransbankController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
