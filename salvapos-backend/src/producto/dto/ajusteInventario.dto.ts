import { IsNotEmpty, IsInt } from 'class-validator';

export class AjustarInventarioDto {
  @IsNotEmpty()
  @IsInt()
  cantidadAjuste: number; // La cantidad a ajustar
}
