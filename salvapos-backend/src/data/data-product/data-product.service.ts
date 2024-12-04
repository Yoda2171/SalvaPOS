import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProductoService } from 'src/producto/producto.service';
import { CategoriaService } from 'src/categoria/categoria.service';
import * as path from 'path';
import * as xlsx from 'xlsx';

@Injectable()
export class DataProductService implements OnModuleInit {
  constructor(
    private readonly productoService: ProductoService,
    private readonly categoriaService: CategoriaService,
  ) {}

  async onModuleInit() {
    console.log('Verificando si existen productos en la base de datos...');

    // Verificar si ya existen productos
    const existingProducts = await this.productoService.findAllProducts(); // Suponiendo que `findAll` devuelve los productos actuales
    if (existingProducts.length > 0) {
      console.log(
        'La tabla de productos ya tiene datos. No se realizará la inserción.',
      );
      return;
    }

    console.log(
      'No se encontraron productos. Procediendo a insertar desde Excel.',
    );

    // Leer el archivo Excel
    const filePath = path.join(process.cwd(), 'products.xlsx'); // Cambia la ruta si es necesario
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const row of data) {
      const codigoBarras = row['CODIGODEBARRA']?.toString().trim() || null;
      const nombre = row['NOMBRE']?.trim();
      const precioCosto = parseFloat(row['PRECIO_DE_COMPRA']) || 0;
      const precioVenta = parseFloat(row['PRECIO_DE_VENTA']) || 0;
      const categoriaNombre = row['CATEGORIA']?.trim();
      const cantidad = parseInt(row['Cantidad']) || 0;

      if (!nombre || !categoriaNombre) {
        console.warn(
          `Datos incompletos para el producto: ${JSON.stringify(row)}`,
        );
        continue;
      }

      // Busca o crea la categoría
      let categoria = await this.categoriaService.findByName(categoriaNombre);
      if (!categoria) {
        categoria = await this.categoriaService.createCategory({
          nombre: categoriaNombre,
        });
      }

      // Inserta el producto
      try {
        await this.productoService.createProducto({
          codigoBarras,
          nombre,
          precioCosto,
          precioVenta,
          cantidad,
          categoriaId: categoria.id,
        });
        console.log(`Producto "${nombre}" insertado correctamente.`);
      } catch (error) {
        console.error(`Error al insertar el producto "${nombre}":`, error);
      }
    }

    console.log('Carga de datos de productos completada.');
  }
}
