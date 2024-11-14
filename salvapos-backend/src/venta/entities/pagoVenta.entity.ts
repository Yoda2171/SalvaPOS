import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venta } from './venta.entity';
import { MetodoPago } from '../../metodo-pago/entities/metodo-pago.entity';

@Entity()
export class PagoVenta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Venta, (venta) => venta.pagos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @ManyToOne(() => MetodoPago, { eager: true })
  @JoinColumn({ name: 'metodo_pago_id' })
  metodoPago: MetodoPago;

  @Column()
  monto: number;
}
