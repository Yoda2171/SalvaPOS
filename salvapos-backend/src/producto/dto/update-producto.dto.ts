import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { CreateProductoDto } from './create-producto.dto';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {
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
  @IsPositive()
  @IsNumber()
  categoriaId: number;
}
