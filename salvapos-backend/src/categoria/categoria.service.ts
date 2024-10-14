import { Injectable } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './entities/categoria.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
}
