import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

//agregale las class validator a las propiedades de la clase
export class CreateProductoDto {
  @IsNotEmpty({ message: 'El código de barras es obligatorio' })
  @IsString({ message: 'El código de barras debe ser una cadena de texto' })
  codigoBarras: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @IsNotEmpty({ message: 'El precio de costo es obligatorio' })
  @IsNumber({}, { message: 'El precio de costo debe ser un número' })
  @Min(0, { message: 'El precio de costo debe ser mayor o igual a 0' })
  precioCosto: number;

  @IsNotEmpty({ message: 'El precio de venta es obligatorio' })
  @IsNumber({}, { message: 'El precio de venta debe ser un número' })
  @Min(0, { message: 'El precio de venta debe ser mayor o igual a 0' })
  precioVenta: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(0, { message: 'La cantidad debe ser mayor o igual a 0' })
  cantidad: number;

  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  categoriaId: number;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  imagen?: string;
}
