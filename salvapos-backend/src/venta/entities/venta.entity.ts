import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { DetalleVenta } from './detalleVenta.entity';
import { PagoVenta } from './pagoVenta.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  total: number;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ default: 'completada' })
  estado: string;

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, { cascade: true })
  detalles: DetalleVenta[];

  @OneToMany(() => PagoVenta, (pago) => pago.venta, { cascade: true })
  pagos: PagoVenta[];

  @ManyToOne(() => User, (user) => user.ventas)
  user: User;
}
