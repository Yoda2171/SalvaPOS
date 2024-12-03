import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { CategoriaService } from 'src/categoria/categoria.service';

@Injectable()
export class DataCategoryService implements OnModuleInit {
  private readonly baseUrl =
    'https://farmaciaelquimico.cl/collections/medicamentos';

  constructor(private readonly categoriaService: CategoriaService) {}

  async onModuleInit() {
    console.log('Iniciando scraping de categorías...');
    const categorias = await this.scrapeCategories();

    for (const categoria of categorias) {
      await this.categoriaService.createCategory({ nombre: categoria });
    }

    console.log(
      `${categorias.length} categorías insertadas en la base de datos.`,
    );
  }

  private async scrapeCategories(): Promise<string[]> {
    const response = await axios.get(this.baseUrl);
    const $ = cheerio.load(response.data);

    const categorias = new Set<string>();
    $('.filter-item').each((_idx, el) => {
      const nombre = $(el).text().trim();
      if (nombre) categorias.add(nombre);
    });

    return Array.from(categorias).slice(0, 10); // Limitar a 10 categorías
  }
}
