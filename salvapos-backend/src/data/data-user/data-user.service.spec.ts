import { Test, TestingModule } from '@nestjs/testing';
import { DataUserService } from './data-user.service';

describe('DataUserService', () => {
  let service: DataUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataUserService],
    }).compile();

    service = module.get<DataUserService>(DataUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
