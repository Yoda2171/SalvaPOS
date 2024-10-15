import { IsOptional, IsString } from 'class-validator';

export class CreateProductFilterDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  codigoBarras?: string;

  @IsOptional()
  @IsString()
  nombreCategoria?: string;
}
