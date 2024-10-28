import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventaService.findOne(+id);
  }

  // Realizar una devolución completa de la venta
  @Delete(':id/devolucion')
  async devolverVenta(@Param('id') id: number) {
    return await this.ventaService.devolverVenta(id);
  }

  @Get()
  async getHistorialVentas(@Query('fecha') fecha: string) {
    // Validar el formato de la fecha 'DD/MM/YYYY'
    const [day, month, year] = fecha.split('/');
    if (
      !day ||
      !month ||
      !year ||
      isNaN(Date.parse(`${year}-${month}-${day}`))
    ) {
      throw new BadRequestException(
        'El formato de la fecha debe ser DD/MM/YYYY',
      );
    }
    console.log(`Buscar ventas por fecha: ${fecha}`);
    // Llamar al servicio para obtener el historial de ventas
    return this.ventaService.getHistorialVentasPorFecha(fecha);
  }
}
