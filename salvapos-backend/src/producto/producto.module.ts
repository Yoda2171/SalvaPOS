import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { CategoriaModule } from 'src/categoria/categoria.module';
import { DataProductService } from 'src/data/data-product/data-product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Producto]), CategoriaModule],
  controllers: [ProductoController],
  providers: [ProductoService, DataProductService],
  exports: [ProductoService],
})
export class ProductoModule {}
