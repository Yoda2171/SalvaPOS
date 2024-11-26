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
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';
import { Producto } from './entities/producto.entity';
import { AjustarInventarioDto } from './dto/ajusteInventario.dto';

@ApiTags('Producto')
@Controller('producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productoService.createProducto(createProductoDto);
  }

  @Get('all')
  findAll() {
    return this.productoService.findAllProducts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productoService.findOneById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productoService.updateProducto(+id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoService.deleteProducto(+id);
  }

  @Get()
  async buscarProducto(@Query() pagination: PaginationDto) {
    return this.productoService.buscarProductos(pagination);
  }

  @Patch('ajustarinventario/:id')
  async ajustarInventario(
    @Param('id') id: string,
    @Body() ajustarInventarioDto: AjustarInventarioDto,
  ): Promise<Producto> {
    return this.productoService.ajustarInventario(
      +id,
      ajustarInventarioDto.cantidadAjuste,
    );
  }
}
