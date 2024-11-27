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
import { CheckDto } from './dto/check.dto';
import { writeFileSync } from 'fs';
import { join } from 'path';

@ApiTags('Producto')
@Controller('producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  create(@Body() createProductoDto: CreateProductoDto) {
    let fileUrl = null;
    if (createProductoDto.imagen) {
      const buffer = Buffer.from(createProductoDto.imagen, 'base64');
      const filename = `${Date.now()}.jpg`;
      const filePath = join(process.cwd(), 'uploads', filename);
      writeFileSync(filePath, buffer);
      fileUrl = `http://localhost:3000/uploads/${filename}`;
    }

    return this.productoService.createProducto(createProductoDto, fileUrl);
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
    let fileUrl = null;
    if (updateProductoDto.imagen) {
      const buffer = Buffer.from(updateProductoDto.imagen, 'base64');
      const filename = `${Date.now()}.jpg`;
      const filePath = join(process.cwd(), 'uploads', filename);
      writeFileSync(filePath, buffer);
      fileUrl = `http://localhost:3000/uploads/${filename}`;
    }

    return this.productoService.updateProducto(+id, updateProductoDto, fileUrl);
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

  @Get('verificar-existencia/producto')
  async verificarExistencia(@Query() query: CheckDto) {
    const { nombre, codigoBarras } = query;
    return this.productoService.verificarExistencia(nombre, codigoBarras);
  }
}
