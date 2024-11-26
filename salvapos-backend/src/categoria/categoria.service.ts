import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './entities/categoria.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}
  async count(): Promise<number> {
    return this.categoriaRepository.count(); // Contar registros
  }

  async createCategory(
    createCategoriaDto: CreateCategoriaDto,
  ): Promise<Categoria> {
    const nuevaCategoria = new Categoria();
    nuevaCategoria.nombre = createCategoriaDto.nombre;

    return await this.categoriaRepository.save(nuevaCategoria);
  }

  async findAll(): Promise<Categoria[]> {
    return await this.categoriaRepository.find({ relations: ['productos'] });
  }

  async findById(id: number): Promise<Categoria> {
    return await this.categoriaRepository.findOne({
      where: { id },
      relations: ['productos'],
    });
  }

  async updateCategory(
    id: number,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOneBy({ id });
    categoria.nombre = updateCategoriaDto.nombre;

    return await this.categoriaRepository.save(categoria);
  }

  async removeCategory(id: number) {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      relations: ['productos'],
    });

    if (!categoria) {
      throw new Error('La categoría no existe');
    }

    if (categoria.productos.length > 0) {
      throw new Error('La categoría tiene productos asociados');
    }

    await this.categoriaRepository.remove(categoria);
  }

  async findByName(nombre: string): Promise<Categoria> {
    return await this.categoriaRepository.findOne({
      where: { nombre: ILike(`%${nombre}%`) },
    });
  }

  // Buscar categorías con paginación y búsqueda
  async buscarCategorias(paginationDto: PaginationDto): Promise<{
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    data: Categoria[];
  }> {
    const { limit = 8, page = 1, search } = paginationDto; // Valores por defecto
    const offset = (page - 1) * limit;

    const findOptions: any = {
      where: {},
      take: limit,
      skip: offset,
      relations: ['productos'], // Incluye la relación con los productos
    };

    // Búsqueda global por nombre de categoría
    if (search) {
      findOptions.where = { nombre: ILike(`%${search}%`) };
    }

    // Obtener categorías paginadas
    const [categorias, totalItems] =
      await this.categoriaRepository.findAndCount(findOptions);

    if (categorias.length === 0) {
      throw new NotFoundException(
        'No se encontraron categorías que coincidan con los criterios de búsqueda',
      );
    }

    // Calcular total de páginas
    const totalPages = Math.ceil(totalItems / limit);

    return {
      totalItems, // Total de categorías
      totalPages, // Total de páginas
      currentPage: page, // Página actual
      limit, // Categorías por página
      data: categorias, // Categorías de la página actual
    };
  }
}
