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
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { DataRoleService } from './data/data-role/data-role.service';
import { DataUserService } from './data/data-user/data-user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql', // Tipo de base de datos
      host: process.env.DATABASE_HOST, // Nombre del servicio MySQL definido en `docker-compose.yml`
      port: +process.env.DATABASE_PORT, // Puerto de MySQL (3306 por defecto)
      username: process.env.DATABASE_USERNAME, // Usuario de MySQL
      password: process.env.DATABASE_PASSWORD, // Contraseña de MySQL
      database: process.env.DATABASE_NAME, // Nombre de la base de datos
      autoLoadEntities: true,
      synchronize: true, // Sincroniza la base de datos según las entidades de TypeORM
    }),
    RoleModule,
    UsersModule,
    ProductoModule,
    CategoriaModule,
    VentaModule,
    MetodoPagoModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DataRoleService,
    DataCategoryService,
    DataProductService,
    DataMetodoPagoService,
    DataUserService,
  ],
})
export class AppModule {}
