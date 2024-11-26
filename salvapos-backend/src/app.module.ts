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
import { TransbankService } from './transbank/transbank.service';
import { TransbankModule } from './transbank/transbank.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'salvaserver.mysql.database.azure.com',
      port: 3306,
      username: 'posadmin',
      password: 'Capstone24',
      database: 'salvabase',
      entities: [__dirname + '/**/*.entity{.ts,.js}' ] ,
      synchronize: true,
    }),
    UsersModule,
    ProductoModule,
    CategoriaModule,
    VentaModule,
    MetodoPagoModule,
    TransbankModule,
  ],
  controllers: [AppController],
  providers: [AppService, DataCategoryService, DataProductService, DataMetodoPagoService, TransbankService],
})
export class AppModule {}
