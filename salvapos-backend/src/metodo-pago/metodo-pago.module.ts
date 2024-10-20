import { Module } from '@nestjs/common';
import { MetodoPagoService } from './metodo-pago.service';
import { MetodoPagoController } from './metodo-pago.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetodoPago } from './entities/metodo-pago.entity';
import { DataMetodoPagoService } from 'src/data/data-metodo-pago/data-metodo-pago.service';

@Module({
  imports: [TypeOrmModule.forFeature([MetodoPago])],
  controllers: [MetodoPagoController],
  providers: [MetodoPagoService, DataMetodoPagoService],
  exports: [MetodoPagoService],
})
export class MetodoPagoModule {}
