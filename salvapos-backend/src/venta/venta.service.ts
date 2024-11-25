import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { Between, DataSource, Repository } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalleVenta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoService } from 'src/producto/producto.service';
import { PagoVenta } from './entities/pagoVenta.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { UsersService } from 'src/users/users.service';
import { SoldProductDto } from './dto/soldProduct.dto';

@Injectable()
export class VentaService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository: Repository<DetalleVenta>,
    @InjectRepository(PagoVenta)
    private readonly pagoVentaRepository: Repository<PagoVenta>,
    private readonly productoService: ProductoService,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { detalles, pagos, total, userId } = createVentaDto;

      // Verificar y actualizar inventario de cada producto dentro de la transacción
      for (const detalle of detalles) {
        const producto = await queryRunner.manager.findOne(Producto, {
          where: { id: detalle.productoId },
        });
        if (!producto) {
          throw new NotFoundException(
            `Producto no encontrado: ${detalle.productoId}`,
          );
        }

        // Actualizar la cantidad del producto dentro de la transacción
        producto.cantidad -= detalle.cantidad;
        await queryRunner.manager.save(producto);
      }

      // Guardar los pagos de la venta
      let montoTotalPagado = 0;
      for (const pago of pagos) {
        if (!pago?.metodoPagoId) {
          throw new BadRequestException('Método de pago no definido.');
        }
        montoTotalPagado += pago.monto;
      }

      // Verificar si el total coincide con la suma de los pagos
      if (montoTotalPagado !== total) {
        throw new BadRequestException(
          'El total de los pagos no coincide con el total de la venta.',
        );
      }

      // Obtener el usuario (cajero)
      const user = await this.usersService.findOneById(userId);
      if (!user) {
        throw new NotFoundException(`Usuario no encontrado: ${userId}`);
      }

      // Crear la venta y los detalles
      const venta = this.ventaRepository.create({ total, user });
      await queryRunner.manager.save(venta);

      // Guardar los detalles de la venta
      for (const detalle of detalles) {
        const detalleVenta = this.detalleVentaRepository.create({
          venta,
          producto: { id: detalle.productoId },
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          subtotal: detalle.cantidad * detalle.precioUnitario,
        });
        await queryRunner.manager.save(detalleVenta);
      }

      // Guardar los pagos de la venta en la tabla de pagos
      for (const pago of pagos) {
        const pagoVenta = this.pagoVentaRepository.create({
          venta,
          metodoPago: { id: pago.metodoPagoId },
          monto: pago.monto,
        });
        await queryRunner.manager.save(pagoVenta);
      }

      // Confirmar la transacción si es correcto
      await queryRunner.commitTransaction();
      return venta;
    } catch (error) {
      // Hacer rollback de la transacción en caso de error
      await queryRunner.rollbackTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error; // Lanza los errores específicos que se han definido
      }
      throw new InternalServerErrorException(
        'Error interno del servidor, por favor intente nuevamente.',
      );
    } finally {
      // Finalizar la transacción y liberar el query runner
      await queryRunner.release();
    }
  }

  // Devolución completa de una venta
  async devolverVenta(ventaId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar la venta con los detalles
      const venta = await this.ventaRepository.findOne({
        where: { id: ventaId, estado: 'completada' }, // Solo ventas completadas
        relations: ['detalles', 'detalles.producto'],
      });

      if (!venta) {
        throw new NotFoundException(
          `Venta con ID ${ventaId} no encontrada o ya devuelta.`,
        );
      }

      // Devolver los productos al inventario
      for (const detalle of venta.detalles) {
        const producto = detalle.producto;

        // Actualizar la cantidad del producto (devolver al inventario)
        producto.cantidad += detalle.cantidad;

        // Guardar el cambio en el inventario dentro de la transacción
        await queryRunner.manager.save(producto);
      }

      // Marcar la venta como "devuelta"
      venta.estado = 'devuelta';
      await queryRunner.manager.save(venta);

      // Confirmar la transacción si all es correcto
      await queryRunner.commitTransaction();
    } catch {
      // Hacer rollback de la transacción en caso de error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Error al realizar la devolución, intente nuevamente.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.ventaRepository.find({
      relations: ['detalles', 'pagos', 'user'],
    });
  }

  async findOne(id: number) {
    return this.ventaRepository.findOne({
      where: { id },
      relations: ['detalles', 'pagos', 'user'],
    });
  }

  // Método para obtener el historial de ventas filtrado por fecha
  async getHistorialVentasPorFecha(fecha: string): Promise<Venta[]> {
    // Convertir la fecha al formato correcto y crear un rango
    const [day, month, year] = fecha.split('/');
    const startDate = new Date(`${year}-${month}-${day}T00:00:00`);
    const endDate = new Date(`${year}-${month}-${day}T23:59:59`);

    // Filtrar ventas que caen entre el rango de la fecha especificada
    return this.ventaRepository.find({
      where: {
        fecha: Between(startDate, endDate),
      },
      relations: ['detalles', 'pagos', 'user'],
    });
  }

  async getSoldProducts(
    startDate: string,
    endDate: string,
  ): Promise<SoldProductDto[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const result = await this.detalleVentaRepository
      .createQueryBuilder('detalle')
      .select('producto.nombre', 'nombreProducto')
      .addSelect('categoria.nombre', 'categoriaProducto')
      .addSelect('SUM(detalle.cantidad)', 'cantidadTotalVendida')
      .addSelect('detalle.precioUnitario', 'precioUnitario')
      .addSelect('SUM(detalle.subtotal)', 'totalVendido')
      .innerJoin('detalle.producto', 'producto')
      .innerJoin('producto.categoria', 'categoria')
      .innerJoin('detalle.venta', 'venta')
      .where('venta.fecha BETWEEN :start AND :end', { start, end })
      .groupBy('producto.nombre')
      .addGroupBy('categoria.nombre')
      .addGroupBy('detalle.precioUnitario')
      .orderBy('SUM(detalle.cantidad)', 'DESC')
      .getRawMany();

    if (!result || result.length === 0) {
      throw new NotFoundException(
        'No se encontraron productos vendidos en el rango de fechas especificado.',
      );
    }

    return result.map((item) => ({
      nombreProducto: item.nombreProducto,
      categoriaProducto: item.categoriaProducto,
      cantidadTotalVendida: parseInt(item.cantidadTotalVendida, 10),
      precioUnitario: parseFloat(item.precioUnitario),
      totalVendido: parseFloat(item.totalVendido),
    }));
  }

  async getSoldCatengorias(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const result = await this.detalleVentaRepository
      .createQueryBuilder('detalle')
      .select('categoria.nombre', 'nombreCategoria')
      .addSelect('SUM(detalle.cantidad)', 'cantidadTotalVendida')
      .addSelect('SUM(detalle.subtotal)', 'totalVendido')
      .innerJoin('detalle.producto', 'producto')
      .innerJoin('producto.categoria', 'categoria')
      .innerJoin('detalle.venta', 'venta')
      .where('venta.fecha BETWEEN :start AND :end', { start, end })
      .groupBy('categoria.nombre')
      .orderBy('SUM(detalle.cantidad)', 'DESC')
      .getRawMany();

    if (!result || result.length === 0) {
      throw new NotFoundException(
        'No se encontraron productos vendidos en el rango de fechas especificado.',
      );
    }

    return result.map((item) => ({
      nombreCategoria: item.nombreCategoria,
      cantidadTotalVendida: parseInt(item.cantidadTotalVendida, 10),
      totalVendido: parseFloat(item.totalVendido),
    }));
  }

  async getSoldMetodoPago(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const result = await this.pagoVentaRepository
      .createQueryBuilder('pago')
      .select('metodoPago.nombre', 'nombreMetodoPago')
      .addSelect('COUNT(pago.id)', 'cantidadVentas')
      .addSelect('SUM(pago.monto)', 'totalVendido')
      .innerJoin('pago.metodoPago', 'metodoPago')
      .innerJoin('pago.venta', 'venta')
      .where('venta.fecha BETWEEN :start AND :end', { start, end })
      .groupBy('metodoPago.nombre')
      .orderBy('COUNT(pago.id)', 'DESC')
      .getRawMany();

    if (!result || result.length === 0) {
      throw new NotFoundException(
        'No se encontraron ventas en el rango de fechas especificado.',
      );
    }

    return result.map((item) => ({
      nombreMetodoPago: item.nombreMetodoPago,
      cantidadVentas: parseInt(item.cantidadVentas, 10),
      totalVendido: parseFloat(item.totalVendido),
    }));
  }

  async getSoldDayAndUser(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const result = await this.ventaRepository
      .createQueryBuilder('venta')
      .select('DATE(venta.fecha)', 'fechaVenta') // Agrupar por día
      .addSelect('COUNT(venta.id)', 'cantidadVentas')
      .addSelect('SUM(venta.total)', 'totalVendido')
      .innerJoin('venta.user', 'user')
      .where('venta.fecha BETWEEN :start AND :end', { start, end })
      .groupBy('DATE(venta.fecha)')
      .orderBy('DATE(venta.fecha)', 'ASC')
      .getRawMany();

    if (!result || result.length === 0) {
      throw new NotFoundException(
        'No se encontraron ventas en el rango de fechas especificado.',
      );
    }

    return result.map((item) => ({
      fechaVenta: item.fechaVenta,
      nombreUsuario: item.nombreUsuario,
      cantidadVentas: parseInt(item.cantidadVentas, 10),
      totalVendido: parseFloat(item.totalVendido),
    }));
  }
}
