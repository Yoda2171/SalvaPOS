import { Role } from 'src/role/entities/role.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    type: 'uuid',
    nullable: true,
    unique: true,
    name: 'reset_password_token',
  })
  resetPasswordToken: string;

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @OneToMany(() => Venta, (venta) => venta.user)
  ventas: Venta[];
}
