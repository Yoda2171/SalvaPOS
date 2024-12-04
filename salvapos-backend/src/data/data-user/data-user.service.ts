import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RoleService } from 'src/role/role.service';
import * as bcryptjs from 'bcryptjs';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class DataUserService {
  private readonly logger = new Logger(DataUserService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly roleService: RoleService,
  ) {}

  async onModuleInit() {
    await this.createTestUsers();
  }

  private async createTestUsers() {
    const users = [
      {
        firstname: 'Test',
        lastname: 'Admin',
        email: 'testadmin@duoc.cl',
        password: '12345678',
        roleId: 1, // Administrador
      },
      {
        firstname: 'Test',
        lastname: 'Cajero',
        email: 'testcajero@duoc.cl',
        password: '12345678',
        roleId: 2, // Cajero
      },
      {
        firstname: 'Usuario',
        lastname: 'Externo',
        email: 'usuarioexterno@duoc.cl',
        password: '12345678',
        roleId: 3, // User
      },
    ];

    for (const user of users) {
      const existingUser = await this.usersService.findOneByEmail(user.email);
      if (!existingUser) {
        const role = await this.roleService.findById(user.roleId);
        const hashedPassword = await bcryptjs.hash(user.password, 10);

        const newUser = new CreateUserDto();
        newUser.firstname = user.firstname;
        newUser.lastname = user.lastname;
        newUser.email = user.email;
        newUser.password = hashedPassword;
        newUser.roleId = role.id;

        await this.usersService.create(newUser);
        this.logger.log(`User ${user.email} created successfully`);
      } else {
        this.logger.log(`User ${user.email} already exists`);
      }
    }
  }
}
