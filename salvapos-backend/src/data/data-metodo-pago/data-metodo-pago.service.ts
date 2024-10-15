import { Injectable } from '@nestjs/common';
import { MetodoPagoService } from 'src/metodo-pago/metodo-pago.service';

@Injectable()
export class DataMetodoPagoService {
  constructor(private readonly metodoPagoService: MetodoPagoService) {}

  async onModuleInit() {
    const metodosPorDefecto = [
      'Efectivo',
      'Tarjeta de debito',
      'Transferencia',
      'Cheque',
      'Tarjeta de credito',
    ];

    for (const nombre of metodosPorDefecto) {
      const metodoExistente = await this.metodoPagoService.findAll();
      if (!metodoExistente.some((mp) => mp.nombre === nombre)) {
        await this.metodoPagoService.create({ nombre });
      }
    }
  }
}
