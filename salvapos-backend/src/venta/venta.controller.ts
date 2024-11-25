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

    console.log(`Buscar ventas por fecha: ${fecha}`);
    // Llamar al servicio para obtener el historial de ventas
    return this.ventaService.getHistorialVentasPorFecha(fecha);
  }

  @Get('productos-vendidos/venta')
  async getSoldProducts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // Validar el formato de las fechas 'YYYY-MM-DD'
    if (
      !startDate ||
      !endDate ||
      isNaN(Date.parse(startDate)) ||
      isNaN(Date.parse(endDate))
    ) {
      throw new BadRequestException(
        'El formato de las fechas debe ser YYYY-MM-DD',
      );
    }
    console.log(
      `Buscar productos vendidos desde: ${startDate} hasta: ${endDate}`,
    );
    // Llamar al servicio para obtener los productos vendidos en el rango de fechas
    return this.ventaService.getSoldProducts(startDate, endDate);
  }

  @Get('categorias-vendidos/venta')
  async getSoldCategories(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // Validar el formato de las fechas 'YYYY-MM-DD'
    if (
      !startDate ||
      !endDate ||
      isNaN(Date.parse(startDate)) ||
      isNaN(Date.parse(endDate))
    ) {
      throw new BadRequestException(
        'El formato de las fechas debe ser YYYY-MM-DD',
      );
    }
    console.log(
      `Buscar categorías vendidas desde: ${startDate} hasta: ${endDate}`,
    );
    // Llamar al servicio para obtener las categorías vendidas en el rango de fechas
    return this.ventaService.getSoldCatengorias(startDate, endDate);
  }

  @Get('metodoPago-vendidos/venta')
  async getsSoldMetodoPago(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // Validar el formato de las fechas 'YYYY-MM-DD'
    if (
      !startDate ||
      !endDate ||
      isNaN(Date.parse(startDate)) ||
      isNaN(Date.parse(endDate))
    ) {
      throw new BadRequestException(
        'El formato de las fechas debe ser YYYY-MM-DD',
      );
    }
    console.log(
      `Buscar categorías vendidas desde: ${startDate} hasta: ${endDate}`,
    );
    // Llamar al servicio para obtener las categorías vendidas en el rango de fechas
    return this.ventaService.getSoldMetodoPago(startDate, endDate);
  }

  @Get('ventasPorDia/venta')
  async getVentasPorDia(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // Validar el formato de las fechas 'YYYY-MM-DD'
    if (
      !startDate ||
      !endDate ||
      isNaN(Date.parse(startDate)) ||
      isNaN(Date.parse(endDate))
    ) {
      throw new BadRequestException(
        'El formato de las fechas debe ser YYYY-MM-DD',
      );
    }
    console.log(
      `Buscar categorías vendidas desde: ${startDate} hasta: ${endDate}`,
    );
    // Llamar al servicio para obtener las categorías vendidas en el rango de fechas
    return this.ventaService.getSoldDayAndUser(startDate, endDate);
  }
}
