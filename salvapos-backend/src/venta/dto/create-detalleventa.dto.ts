import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateDetalleVentaDto {
  @IsInt()
  productoId: number;

  @IsInt()
  @IsPositive()
  cantidad: number;

  @IsNumber()
  @IsPositive()
  precioUnitario: number;
}
