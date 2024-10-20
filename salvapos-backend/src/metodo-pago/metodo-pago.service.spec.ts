import { Test, TestingModule } from '@nestjs/testing';
import { MetodoPagoService } from './metodo-pago.service';

describe('MetodoPagoService', () => {
  let service: MetodoPagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetodoPagoService],
    }).compile();

    service = module.get<MetodoPagoService>(MetodoPagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
