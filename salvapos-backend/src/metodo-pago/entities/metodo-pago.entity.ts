import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PagoVenta } from '../../venta/entities/pagoVenta.entity';

@Entity()
export class MetodoPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToMany(() => PagoVenta, (pagoVenta) => pagoVenta.metodoPago)
  pagos: PagoVenta[];
}
