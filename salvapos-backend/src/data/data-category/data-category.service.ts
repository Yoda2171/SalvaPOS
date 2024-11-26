import { Injectable, OnModuleInit } from '@nestjs/common';
import { CategoriaService } from 'src/categoria/categoria.service';
import { CreateCategoriaDto } from 'src/categoria/dto/create-categoria.dto';
import { faker } from '@faker-js/faker';

@Injectable()
export class DataCategoryService implements OnModuleInit {
  constructor(private readonly categoriaService: CategoriaService) {}

  async onModuleInit() {
    const count = await this.categoriaService.count(); // Verificar si hay registros

    if (count > 0) {
      console.log(
        'La tabla de categorías ya está poblada. No se insertaron datos.',
      );
      return;
    }

    const categorias = this.generateCategories(15);

    for (const categoria of categorias) {
      await this.categoriaService.createCategory(categoria);
    }

    console.log('15 categorías insertadas en la base de datos.');
  }

  generateCategories(cantidad: number): CreateCategoriaDto[] {
    return Array.from({ length: cantidad }, () => ({
      nombre: faker.commerce.department(),
    }));
  }
}
