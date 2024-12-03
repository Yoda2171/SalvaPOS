import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ProductoService } from 'src/producto/producto.service';
import { CategoriaService } from 'src/categoria/categoria.service';
import { CreateProductoDto } from 'src/producto/dto/create-producto.dto';

@Injectable()
export class DataProductService implements OnModuleInit {
  private readonly baseUrl =
    'https://farmaciaelquimico.cl/collections/medicamentos';

  constructor(
    private readonly productoService: ProductoService,
    private readonly categoriaService: CategoriaService,
  ) {}

  async onModuleInit() {
    console.log('Iniciando scraping de productos...');
    const categorias = await this.categoriaService.findAll();

    if (categorias.length === 0) {
      console.log('No hay categorías disponibles. No se insertaron productos.');
      return;
    }

    const productos = await this.scrapeProducts(categorias);

    for (const producto of productos) {
      await this.productoService.createProducto(producto);
    }

    console.log(
      `${productos.length} productos insertados en la base de datos.`,
    );
  }

  private async scrapeProducts(
    categorias: any[],
  ): Promise<CreateProductoDto[]> {
    const response = await axios.get(this.baseUrl);
    const $ = cheerio.load(response.data);

    const productos: CreateProductoDto[] = [];

    const productCards = $('.product-card').toArray();

    for (const el of productCards) {
      const nombre = $(el).find('.product-title').text().trim();
      const precioTexto = $(el)
        .find('.price')
        .first()
        .text()
        .replace(/\D/g, '');
      const imagen = $(el).find('.product-card__image img').attr('src');
      const relativeUrl = $(el).find('a').attr('href'); // URL relativa al producto

      if (nombre && precioTexto && imagen && relativeUrl) {
        const precioVenta = parseInt(precioTexto);
        const precioCosto = Math.round(precioVenta * 0.8); // Estimar precio costo

        const productPageUrl = `https://farmaciaelquimico.cl${relativeUrl}`;
        const codigoBarras = await this.scrapeProductSku(productPageUrl); // Obtener SKU desde la página del producto

        productos.push({
          codigoBarras,
          nombre,
          precioCosto,
          precioVenta,
          cantidad: Math.floor(Math.random() * 100) + 1, // Cantidad aleatoria
          categoriaId:
            categorias[Math.floor(Math.random() * categorias.length)].id, // Categoría aleatoria
          imagen: imagen.startsWith('http') ? imagen : `https:${imagen}`, // Asegurar URL válida
        });
      }
    }

    return productos.slice(0, 50); // Limitar a 50 productos
  }

  private async scrapeProductSku(productPageUrl: string): Promise<string> {
    try {
      const response = await axios.get(productPageUrl);
      const $ = cheerio.load(response.data);

      // Ajusta el selector para el código de barras o SKU según el DOM de la página
      const codigoBarras = $('[data-sku], .product-sku').text().trim();
      return codigoBarras || Math.random().toString(36).substring(2, 12); // Genera uno si no existe
    } catch (error) {
      console.error(
        `Error obteniendo el SKU del producto: ${productPageUrl}`,
        error,
      );
      return Math.random().toString(36).substring(2, 12); // Genera uno si falla
    }
  }
}
