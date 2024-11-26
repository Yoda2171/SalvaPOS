import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreatePagoVentaDto {
  @IsInt()
  metodoPagoId: number;

  @IsNumber()
  @IsPositive()
  monto: number;
}
