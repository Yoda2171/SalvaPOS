import { Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoleGuard } from './auth/role.guard';

// Definimos las rutas de la aplicación
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component'),
    children: [
      {
        path: 'home',
        title: 'Home',
        loadComponent: () => import('./dashboard/pages/home/home.component'),
        data: { expectedRole: 'Cajero' },
      },
      {
        path: 'inventario',
        title: 'Inventario',
        loadComponent: () =>
          import('./dashboard/pages/inventario/inventario.component'),
        data: { expectedRole: 'Cajero' },
      },
      {
        path: 'categoria',
        title: 'Categoria',
        loadComponent: () =>
          import('./dashboard/pages/categoria/categoria.component'),
        data: { expectedRole: 'Cajero' },
      },
      {
        path: 'addproduct',
        title: 'Addproduct',
        loadComponent: () =>
          import(
            './dashboard/pages/inventario/pages/addProducto/addProducto.component'
          ),
        canActivate: [RoleGuard],
        data: { expectedRole: 'Cajero' },
      },
      {
        path: 'editproduct/:id', // Ruta dinámica para editar producto
        title: 'Editproduct',
        loadComponent: () =>
          import(
            './dashboard/pages/inventario/pages/editProducto/editProducto.component'
          ),
        canActivate: [RoleGuard],
        data: { expectedRole: 'Cajero' },
      },

      {
        path: 'venta',
        title: 'Venta',
        loadComponent: () => import('./dashboard/pages/venta/venta.component'),
        data: { expectedRole: 'Cajero' },
      },
      {
        path: 'historialventa',
        title: 'HisotorialVenta',
        loadComponent: () =>
          import(
            './dashboard/pages/venta/pages/historialVenta/historialVenta.component'
          ),
        canActivate: [RoleGuard],
        data: { expectedRole: 'Cajero' },
      },

      {
        path: 'reportes',
        title: 'Reportes',
        loadComponent: () =>
          import('./dashboard/pages/reportes/reportes.component'),
        canActivate: [RoleGuard],
        data: { expectedRole: 'Cajero' },
      },
      {
        path: 'reportesventa',
        title: 'Reportes Venta',
        loadComponent: () =>
          import(
            './dashboard/pages/reportes/pages/reporteVenta/reporteVenta.component'
          ),
        canActivate: [RoleGuard],
        data: { expectedRole: 'Cajero' },
      },
      {
        path: 'reportesinvetario',
        title: 'Reportes Inventario',
        loadComponent: () =>
          import(
            './dashboard/pages/reportes/pages/inventario/inventario.component'
          ),
        canActivate: [RoleGuard],
        data: { expectedRole: 'Cajero' },
      },
      {
        path: 'reportescategoria',
        title: 'Reportes Categoria',
        loadComponent: () =>
          import(
            './dashboard/pages/reportes/pages/reporteCategoria/reporteCategoria.component'
          ),
        canActivate: [RoleGuard],
        data: { expectedRole: 'Cajero' },
      },
      {
        path: 'reportesmetodopago',
        title: 'Reportes Metodos de pago',
        loadComponent: () =>
          import(
            './dashboard/pages/reportes/pages/reporteMetodoPago/reporteMetodoPago.component'
          ),
        canActivate: [RoleGuard],
        data: { expectedRole: 'Cajero' },
      },
      // Redirigir desde 'dashboard' a 'dashboard/home' si la ruta está vacía
      {
        path: '',
        redirectTo: 'home', // Redirigir a 'dashboard/home'
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./dashboard/pages/auth/login/login.component'),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./dashboard/pages/auth/register/register.component'),
    canActivate: [RoleGuard],
    data: { expectedRole: 'Administrador' },
  },
  // Redirigir al dashboard si la ruta está vacía
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  // Ruta wildcard para manejar rutas no encontradas
  {
    path: '**',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
];
