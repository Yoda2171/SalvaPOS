import { Injectable, OnModuleInit } from '@nestjs/common';
import { CategoriaService } from 'src/categoria/categoria.service';
import * as path from 'path';
import * as xlsx from 'xlsx';

@Injectable()
export class DataCategoryService implements OnModuleInit {
  constructor(private readonly categoriaService: CategoriaService) {}

  async onModuleInit() {
    // Verificar si ya existen categorías
    const existingCategories = await this.categoriaService.findAll(); // Suponiendo que `findAll` devuelve las categorías actuales
    if (existingCategories.length > 0) {
      console.log(
        'La tabla de categorías ya tiene datos. No se realizará la inserción.',
      );
      return;
    }

    console.log(
      'No se encontraron categorías. Procediendo a insertar desde Excel.',
    );

    // Leer el archivo Excel
    const filePath = path.join(process.cwd(), 'category.xlsx'); // Cambia la ruta si es necesario
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const row of data) {
      const categoryName = row['Nombre']; // Cambia según el nombre exacto de la columna
      if (categoryName && categoryName.trim() !== '') {
        try {
          await this.categoriaService.createCategory({ nombre: categoryName });
          console.log(`Categoría "${categoryName}" insertada correctamente.`);
        } catch (error) {
          console.error(
            `Error al insertar la categoría "${categoryName}":`,
            error,
          );
        }
      }
    }
  }
}
