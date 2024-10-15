import { IsOptional, IsString } from 'class-validator';

export class CategoriaFilterParamDto {
  @IsOptional()
  @IsString()
  nombre?: string;
}
