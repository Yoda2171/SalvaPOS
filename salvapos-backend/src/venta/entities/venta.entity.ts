import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DetalleVenta } from './detalleVenta.entity';
import { PagoVenta } from './pagoVenta.entity';

@Entity()
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ default: 'completada' })
  estado: string;

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, { cascade: true })
  detalles: DetalleVenta[];

  @OneToMany(() => PagoVenta, (pago) => pago.venta, { cascade: true })
  pagos: PagoVenta[];
}
