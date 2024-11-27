import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    fileUrl?: any,
  ): Promise<Producto> {
    // Verificar si el producto con el código de barras ya existe
    const productoExistente = await this.productoRepository.findOne({
      where: { codigoBarras: createProductoDto.codigoBarras },
    });

    if (productoExistente) {
      throw new ConflictException(
        'Ya existe un producto con ese código de barras',
      );
    }

    const productoExistenteNombre = await this.productoRepository.findOne({
      where: { nombre: createProductoDto.nombre },
    });

    if (productoExistenteNombre) {
      throw new ConflictException('Ya existe un producto con ese nombre');
    }

    const categoria = await this.categoriaService.findById(
      createProductoDto.categoriaId,
    );

    // Verificar si la categoría existe
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const nuevoProducto = new Producto();
    nuevoProducto.codigoBarras = createProductoDto.codigoBarras;
    nuevoProducto.nombre = createProductoDto.nombre;
    nuevoProducto.precioCosto = createProductoDto.precioCosto;
    nuevoProducto.precioVenta = createProductoDto.precioVenta;
    nuevoProducto.cantidad = createProductoDto.cantidad;
    nuevoProducto.categoria = categoria;
    nuevoProducto.imagen = fileUrl;

    // Validación: el precio de venta no puede ser menor que el precio de costo
    if (nuevoProducto.precioVenta < nuevoProducto.precioCosto) {
      throw new BadRequestException(
        'El precio de venta no puede ser menor que el precio de costo',
      );
    }

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
    fileUrl: any,
  ): Promise<Producto> {
    const categoria = await this.categoriaService.findById(
      updateProductoDto.categoriaId,
    );
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const producto = await this.productoRepository.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar si el código de barras del producto está siendo actualizado y ya existe
    if (
      updateProductoDto.codigoBarras &&
      updateProductoDto.codigoBarras !== producto.codigoBarras
    ) {
      const productoExistente = await this.productoRepository.findOne({
        where: { codigoBarras: updateProductoDto.codigoBarras },
      });

      if (productoExistente) {
        throw new ConflictException(
          'Ya existe un producto con ese código de barras',
        );
      }
    }

    // Verificar si el nombre del producto está siendo actualizado y ya existe
    if (
      updateProductoDto.nombre.toLowerCase().trim() &&
      updateProductoDto.nombre.toLowerCase().trim() !==
        producto.nombre.toLowerCase().trim()
    ) {
      const productoExistenteNombre = await this.productoRepository.findOne({
        where: { nombre: updateProductoDto.nombre.trim() },
      });

      if (productoExistenteNombre) {
        throw new ConflictException('Ya existe un producto con ese nombre');
      }
    }

    producto.codigoBarras = updateProductoDto.codigoBarras.trim();
    producto.nombre = updateProductoDto.nombre.trim();
    producto.precioCosto = updateProductoDto.precioCosto;
    producto.precioVenta = updateProductoDto.precioVenta;
    producto.cantidad = updateProductoDto.cantidad;
    producto.categoria = categoria;
    producto.imagen = fileUrl;

    // Validación: el precio de venta no puede ser menor que el precio de costo
    if (producto.precioVenta < producto.precioCosto) {
      throw new BadRequestException(
        'El precio de venta no puede ser menor que el precio de costo',
      );
    }

    return await this.productoRepository.save(producto);
  }

  async deleteProducto(id: number): Promise<void> {
    const producto = await this.productoRepository.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

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

  async verificarExistencia(nombre?: string, codigoBarras?: string) {
    const findOptions: any = {
      where: [],
    };

    // Ensure 'nombre' is a valid string before adding it to the query
    if (nombre && typeof nombre === 'string') {
      findOptions.where.push({ nombre: Like(`%${nombre}%`) });
    }

    // Ensure 'codigoBarras' is a valid string before adding it to the query
    if (codigoBarras && typeof codigoBarras === 'string') {
      findOptions.where.push({ codigoBarras: Like(`%${codigoBarras}%`) });
    }

    // Check if there's any condition to apply
    if (findOptions.where.length === 0) {
      // If both parameters are invalid (undefined or not strings), return a response indicating no results
      return { existe: false };
    }

    const productoExistente =
      await this.productoRepository.findOne(findOptions);

    if (productoExistente) {
      return { existe: true, producto: productoExistente };
    }

    return { existe: false };
  }
}
