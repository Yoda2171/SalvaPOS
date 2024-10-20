import { IsOptional, IsPositive, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number; // Número de elementos por página

  @IsOptional()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  page?: number; // Número de la página, comienza en 1

  @IsOptional()
  @IsString()
  @Type(() => String)
  search?: string; // Búsqueda global en campos específicos
}
