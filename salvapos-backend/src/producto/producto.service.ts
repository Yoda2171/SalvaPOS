import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Repository } from 'typeorm';
import { CategoriaService } from 'src/categoria/categoria.service';

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
}
