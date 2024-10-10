import { Categoria } from 'src/categoria/entities/categoria.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  codigoBarras: string;
  @Column()
  nombre: string;
  @Column()
  precioCosto: number;
  @Column()
  precioVenta: number;

  @Column('int')
  cantidad: number;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos)
  categoria: Categoria;
}
