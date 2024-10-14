import { Injectable, OnModuleInit } from '@nestjs/common';
import { CategoriaService } from 'src/categoria/categoria.service';
import { ProductoService } from 'src/producto/producto.service';
import { faker } from '@faker-js/faker';
import { CreateProductoDto } from 'src/producto/dto/create-producto.dto';

@Injectable()
export class DataProductService implements OnModuleInit {
  constructor(
    private readonly productoService: ProductoService,
    private readonly categoriaService: CategoriaService,
  ) {}

  async onModuleInit() {
    const productoCount = await this.productoService.count(); // Verificar si ya hay productos

    if (productoCount > 0) {
      console.log(
        'La tabla de productos ya está poblada. No se insertaron datos.',
      );
      return;
    }

    const categorias = await this.categoriaService.findAll(); // Obtener todas las categorías

    if (categorias.length === 0) {
      console.log(
        'No hay categorías disponibles. No se pueden insertar productos.',
      );
      return;
    }

    const productos = this.generateRandomProducts(categorias, 100);

    for (const producto of productos) {
      await this.productoService.createProducto(producto);
    }

    console.log('100 productos insertados en la base de datos.');
  }

  generateRandomProducts(
    categorias: any[],
    cantidad: number,
  ): CreateProductoDto[] {
    return Array.from({ length: cantidad }, () => {
      const categoria =
        categorias[Math.floor(Math.random() * categorias.length)]; // Selección aleatoria

      return {
        codigoBarras: faker.string.alphanumeric(8),
        nombre: faker.commerce.productName(),
        precioCosto: parseFloat(faker.commerce.price()),
        precioVenta: parseFloat(faker.commerce.price()),
        cantidad: faker.number.int({ min: 0, max: 100 }),
        categoriaId: categoria.id, // Asignar categoría aleatoria
      };
    });
  }
}
