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
    private readonly dataSource: DataSource,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { detalles, pagos, total } = createVentaDto;

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

        if (producto.cantidad < detalle.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para el producto: ${producto.nombre}`,
          );
        }

        // Actualizar la cantidad del producto dentro de la transacción
        // Guardar el cambio en la cantidad dentro de la transacción
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

      // Crear la venta y los detalles
      const venta = this.ventaRepository.create({ total });
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
      relations: ['detalles', 'pagos'],
    });
  }

  async findOne(id: number) {
    return this.ventaRepository.findOne({
      where: { id },
      relations: ['detalles', 'pagos'],
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
      relations: ['detalles', 'pagos'],
    });
  }
}
