import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class CheckDto {
  @IsOptional()
  @IsString()
  @Type(() => String)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  codigoBarras?: string;
}
