import { Injectable } from '@nestjs/common';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class DataRoleService {
  constructor(private readonly roleService: RoleService) {}

  async onModuleInit() {
    const rolesPorDefecto = ['Administrador', 'Cajero'];

    for (const nombre of rolesPorDefecto) {
      const rolesExistentes = await this.roleService.findAll();
      if (!rolesExistentes.some((role) => role.name === nombre)) {
        await this.roleService.create({ name: nombre });
      }
    }
  }
}
