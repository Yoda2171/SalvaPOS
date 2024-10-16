import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { ApiTags } from '@nestjs/swagger';
import { CategoriaFilterParamDto } from './dto/categoria-filter-param.dto';

@ApiTags('Categoria')
@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Post()
  createCategory(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriaService.createCategory(createCategoriaDto);
  }

  @Get('all')
  findAll() {
    return this.categoriaService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.categoriaService.findById(+id);
  }

  @Patch(':id')
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return this.categoriaService.updateCategory(+id, updateCategoriaDto);
  }

  @Delete(':id')
  removeCategory(@Param('id') id: string) {
    return this.categoriaService.removeCategory(+id);
  }

  @Get()
  search(@Query() filter: CategoriaFilterParamDto) {
    return this.categoriaService.findByName(filter.nombre);
  }

  /* @Post('search')
  search(@Body() filter: CategoriaFilterParamDto) {
    return this.categoriaService.findByName(filter.nombre);
  } */
}
