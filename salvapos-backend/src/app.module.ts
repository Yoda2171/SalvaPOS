import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductoModule } from './producto/producto.module';
import { CategoriaModule } from './categoria/categoria.module';
import { DataCategoryService } from './data/data-category/data-category.service';
import { DataProductService } from './data/data-product/data-product.service';
import { VentaModule } from './venta/venta.module';
import { DataMetodoPagoService } from './data/data-metodo-pago/data-metodo-pago.service';
import { MetodoPagoModule } from './metodo-pago/metodo-pago.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'salvapos_user',
      password: '123456',
      database: 'salvapos_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    ProductoModule,
    CategoriaModule,
    VentaModule,
    MetodoPagoModule,
  ],
  controllers: [AppController],
  providers: [AppService, DataCategoryService, DataProductService, DataMetodoPagoService],
})
export class AppModule {}
