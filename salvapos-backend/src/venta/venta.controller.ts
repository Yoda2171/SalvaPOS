import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Venta')
@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Post()
  create(@Body() createVentaDto: CreateVentaDto) {
    return this.ventaService.create(createVentaDto);
  }

  @Get()
  findAll() {
    return this.ventaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventaService.findOne(+id);
  }

  // Realizar una devolución completa de la venta
  @Delete(':id/devolucion')
  async devolverVenta(@Param('id') id: number) {
    return await this.ventaService.devolverVenta(id);
  }
}
