import { Injectable } from '@nestjs/common';
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
    private productoRepository: Repository<Producto>,
    private categoriaService: CategoriaService, // Servicio para buscar categoría
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
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

  async findAll(): Promise<Producto[]> {
    return await this.productoRepository.find({ relations: ['categoria'] });
  }

  findOne(id: number) {
    return `This action returns a #${id} producto`;
  }

  update(id: number, updateProductoDto: UpdateProductoDto) {
    return `This action updates a #${id} producto`;
  }

  async delete(id: number): Promise<void> {
    await this.productoRepository.delete(id);
  }
}
