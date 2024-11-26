import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Like, Repository } from 'typeorm';
import { CategoriaService } from 'src/categoria/categoria.service';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly categoriaService: CategoriaService, // Servicio para buscar categoría
  ) {}

  async count(): Promise<number> {
    return this.productoRepository.count(); // Contar registros
  }

  async createProducto(
    createProductoDto: CreateProductoDto,
  ): Promise<Producto> {
    const categoria = await this.categoriaService.findById(
      createProductoDto.categoriaId,
    );
    const nuevoProducto = new Producto();
    nuevoProducto.codigoBarras = createProductoDto.codigoBarras;
    nuevoProducto.nombre = createProductoDto.nombre;
    nuevoProducto.precioCosto = createProductoDto.precioCosto;
    nuevoProducto.precioVenta = createProductoDto.precioVenta;
    nuevoProducto.cantidad = createProductoDto.cantidad;
    nuevoProducto.categoria = categoria;

    return await this.productoRepository.save(nuevoProducto);
  }

  async findAllProducts(): Promise<Producto[]> {
    return await this.productoRepository.find({ relations: ['categoria'] });
  }

  async findOneById(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: ['categoria'],
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async findOneByCodigoBarras(codigoBarras: string): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { codigoBarras },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async updateProducto(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const categoria = await this.categoriaService.findById(
      updateProductoDto.categoriaId,
    );
    const producto = await this.productoRepository.findOneBy({ id });
    producto.codigoBarras = updateProductoDto.codigoBarras;
    producto.nombre = updateProductoDto.nombre;
    producto.precioCosto = updateProductoDto.precioCosto;
    producto.precioVenta = updateProductoDto.precioVenta;
    producto.cantidad = updateProductoDto.cantidad;
    producto.categoria = categoria;

    return await this.productoRepository.save(producto);
  }

  async deleteProducto(id: number): Promise<void> {
    await this.productoRepository.delete(id);
  }

  async buscarProductos(paginationDto: PaginationDto) {
    const { limit = 8, page = 1, search } = paginationDto; // Valores por defecto: limit 10, page 1

    // Calcular el offset basado en la página y el límite
    const offset = (page - 1) * limit;

    const findOptions: any = {
      where: {},
      take: limit,
      skip: offset,
      relations: ['categoria'], // Incluye la relación con la categoría
    };

    // Búsqueda global en varios campos
    if (search) {
      findOptions.where = [
        { nombre: Like(`%${search}%`) },
        { codigoBarras: Like(`%${search}%`) },
        { categoria: { nombre: Like(`%${search}%`) } },
      ];
    }

    // Obtener productos paginados
    const [productos, totalItems] =
      await this.productoRepository.findAndCount(findOptions);

    if (productos.length === 0) {
      throw new NotFoundException(
        'No se encontraron productos que coincidan con los criterios de búsqueda',
      );
    }

    // Calcular total de páginas
    const totalPages = Math.ceil(totalItems / limit);

    return {
      totalItems, // Total de productos
      totalPages, // Total de páginas
      currentPage: page, // Página actual
      limit, // Items por página
      data: productos, // Productos de la página actual
    };
  }

  // Método para ajustar el inventario por código de barras o nombre
  async ajustarInventario(
    id: number, // Puede ser nombre o código de barras
    cantidadAjuste: number, // Cantidad a ajustar (positiva o negativa)
  ): Promise<Producto> {
    // Buscar por código de barras o nombre
    const producto = await this.productoRepository.findOne({
      where: { id },
    });

    // Verificar si el producto existe
    if (!producto) {
      throw new NotFoundException(
        'Producto no encontrado con el código de barras o nombre proporcionado',
      );
    }

    // Ajustar la cantidad
    const nuevaCantidad = producto.cantidad + cantidadAjuste;

    // Validar que la nueva cantidad no sea negativa
    if (nuevaCantidad < 0) {
      throw new Error(
        `La cantidad ajustada (${nuevaCantidad}) no puede ser negativa`,
      );
    }

    // Actualizar la cantidad del producto
    producto.cantidad = nuevaCantidad;
    return await this.productoRepository.save(producto);
  }
}
