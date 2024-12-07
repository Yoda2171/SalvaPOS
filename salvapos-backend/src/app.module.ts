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

import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { NotificationService } from './notification/notification.service';
import { TransbankModule } from './transbank/transbank.module';

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
      timezone: 'local', // Zona horaria
    }),

    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // Cambia por tu servidor SMTP
        port: 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: 'pablo.avila2171@gmail.com', // Tu correo
          pass: 'cmpt tahp myfq jwkn', // Tu contraseña o token de aplicación
        },
      },
      defaults: {
        from: '"Soporte SalvaPos" <salvapos@gmail.com>', // Configura el remitente
      },
      template: {
        dir: join(process.cwd(), 'templates'), // Directorio de plantillas
        adapter: new HandlebarsAdapter(), // Adaptador para plantillas
        options: {
          strict: true,
        },
      },
    }),
    RoleModule,
    UsersModule,
    ProductoModule,
    CategoriaModule,
    VentaModule,
    MetodoPagoModule,
    AuthModule,
    TransbankModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DataRoleService,
    DataCategoryService,
    DataProductService,
    DataMetodoPagoService,
    DataUserService,
    NotificationService,
  ],
})
export class AppModule {}
