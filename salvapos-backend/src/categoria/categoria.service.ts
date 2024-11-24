import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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
    return this.categoriaRepository.count();
  }

  async createCategory(
    createCategoriaDto: CreateCategoriaDto,
  ): Promise<Categoria> {
    const existingCategory = await this.categoriaRepository.findOne({
      where: { nombre: createCategoriaDto.nombre },
    });
    if (existingCategory) {
      throw new ConflictException('La categoría con este nombre ya existe');
    }

    const nuevaCategoria = new Categoria();
    nuevaCategoria.nombre = createCategoriaDto.nombre;

    return await this.categoriaRepository.save(nuevaCategoria);
  }

  async findAll(): Promise<Categoria[]> {
    return await this.categoriaRepository.find({ relations: ['productos'] });
  }

  async findById(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      relations: ['productos'],
    });
    if (!categoria) {
      throw new NotFoundException('La categoría no existe');
    }
    return categoria;
  }
  async updateCategory(
    id: number,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOneBy({ id });
    if (!categoria) {
      throw new NotFoundException('La categoría no existe');
    }

    if (
      categoria.nombre.toLowerCase() !== updateCategoriaDto.nombre.toLowerCase()
    ) {
      const existingCategory = await this.categoriaRepository.findOne({
        where: { nombre: updateCategoriaDto.nombre },
      });
      if (existingCategory) {
        throw new ConflictException('La categoría con este nombre ya existe');
      }
    }

    categoria.nombre = updateCategoriaDto.nombre;
    return await this.categoriaRepository.save(categoria);
  }

  async removeCategory(id: number) {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      relations: ['productos'],
    });

    if (!categoria) {
      throw new NotFoundException('La categoría no existe');
    }

    if (categoria.productos.length > 0) {
      throw new ConflictException('La categoría tiene productos asociados');
    }

    await this.categoriaRepository.remove(categoria);
  }

  async findByName(nombre: string): Promise<Categoria> {
    return await this.categoriaRepository.findOne({
      where: { nombre: ILike(`%${nombre}%`) },
    });
  }

  async buscarCategorias(paginationDto: PaginationDto): Promise<{
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    data: Categoria[];
  }> {
    const { limit = 8, page = 1, search } = paginationDto;
    const offset = (page - 1) * limit;

    const findOptions: any = {
      where: {},
      take: limit,
      skip: offset,
      relations: ['productos'],
    };

    if (search) {
      findOptions.where = { nombre: ILike(`%${search}%`) };
    }

    const [categorias, totalItems] =
      await this.categoriaRepository.findAndCount(findOptions);

    if (categorias.length === 0) {
      throw new NotFoundException(
        'No se encontraron categorías que coincidan con los criterios de búsqueda',
      );
    }

    const totalPages = Math.ceil(totalItems / limit);

    return {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
      data: categorias,
    };
  }
}
