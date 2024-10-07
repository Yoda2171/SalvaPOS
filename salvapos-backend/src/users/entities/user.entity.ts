import { Column, Entity } from 'typeorm';

@Entity()
export class User {
  @Column({ primary: true, generated: true })
  id: number;

  name: string;

  email: string;

  contraseña: string;

  rol: string;
}
