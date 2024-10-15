import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { DataSource, Repository } from 'typeorm';
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
        producto.cantidad -= detalle.cantidad;
        await queryRunner.manager.save(producto); // Guardar el cambio en la cantidad dentro de la transacción
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

  findAll() {
    return this.ventaRepository.find({
      relations: ['detalles', 'pagos'],
    });
  }

  findOne(id: number) {
    return this.ventaRepository.findOne({
      where: { id },
      relations: ['detalles', 'pagos'],
    });
  }

  update(id: number, updateVentaDto: UpdateVentaDto) {
    return `This action updates a #${id} venta`;
  }

  remove(id: number) {
    return `This action removes a #${id} venta`;
  }
}
