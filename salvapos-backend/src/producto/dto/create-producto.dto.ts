import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

//agregale las class validator a las propiedades de la clase
export class CreateProductoDto {
  @IsNotEmpty()
  codigoBarras: string;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  precioCosto: number;

  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  precioVenta: number;

  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  cantidad: number;

  @IsNotEmpty()
  @IsNumber()
  categoriaId: number;
}
