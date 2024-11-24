import { IsArray, IsNumber } from 'class-validator';
import { CreateDetalleVentaDto } from './create-detalleventa.dto';
import { CreatePagoVentaDto } from './create-pagoventa.dto';

export class CreateVentaDto {
  @IsArray()
  detalles: CreateDetalleVentaDto[];

  @IsArray()
  pagos: CreatePagoVentaDto[];

  @IsNumber()
  total: number;

  @IsNumber()
  userId: number;
}
