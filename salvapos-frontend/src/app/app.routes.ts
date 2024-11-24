import { Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from './dashboard/pages/auth/auth.guard';
import { SuperAdminGuard } from './dashboard/pages/auth/super-admin.guard';  // Corregí el nombre a SuperAdminGuard

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
        canActivate: [AuthGuard],  // Agrega el guard para esta ruta
      },
      {
        path: 'inventario',
        title: 'Inventario',
        loadComponent: () =>
          import('./dashboard/pages/inventario/inventario.component'),
        canActivate: [AuthGuard],  // Protege la ruta
      },
      {
        path: 'categoria',
        title: 'Categoria',
        loadComponent: () =>
          import('./dashboard/pages/categoria/categoria.component'),
        canActivate: [AuthGuard],  // Protege la ruta
      },
      {
        path: 'addproduct',
        title: 'Addproduct',
        loadComponent: () =>
          import(
            './dashboard/pages/inventario/pages/addProducto/addProducto.component'
          ),
        canActivate: [AuthGuard],  // Protege la ruta
      },
      {
        path: 'editproduct/:id', // Ruta dinámica para editar producto
        title: 'Editproduct',
        loadComponent: () =>
          import(
            './dashboard/pages/inventario/pages/editProducto/editProducto.component'
          ),
        canActivate: [AuthGuard],  // Protege la ruta
      },
      {
        path: 'venta',
        title: 'Venta',
        loadComponent: () => import('./dashboard/pages/venta/venta.component'),
        canActivate: [AuthGuard],  // Protege la ruta
      },
      {
        path: 'historialventa',
        title: 'HisotorialVenta',
        loadComponent: () =>
          import(
            './dashboard/pages/venta/pages/historialVenta/historialVenta.component'
          ),
        canActivate: [AuthGuard],  // Protege la ruta
      },
      {
        path: 'reportes',
        title: 'Reportes',
        loadComponent: () =>
          import('./dashboard/pages/reportes/reportes.component'),
        canActivate: [AuthGuard],  // Protege la ruta
      },
      {
        path: 'reportesventa',
        title: 'Reportes Venta',
        loadComponent: () =>
          import(
            './dashboard/pages/reportes/pages/reporteVenta/reporteVenta.component'
          ),
        canActivate: [AuthGuard],  // Protege la ruta
      },
      {
        path: 'reportesinvetario',
        title: 'Reportes Inventario',
        loadComponent: () =>
          import(
            './dashboard/pages/reportes/pages/inventario/inventario.component'
          ),
        canActivate: [AuthGuard],  // Protege la ruta
      },
      {
        path: 'reportescategoria',
        title: 'Reportes Categoria',
        loadComponent: () =>
          import(
            './dashboard/pages/reportes/pages/reporteCategoria/reporteCategoria.component'
          ),
        canActivate: [AuthGuard],  // Protege la ruta
      },
      {
        path: 'reportesmetodopago',
        title: 'Reportes Metodos de pago',
        loadComponent: () =>
          import(
            './dashboard/pages/reportes/pages/reporteMetodoPago/reporteMetodoPago.component'
          ),
        canActivate: [AuthGuard],  // Protege la ruta
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
    canActivate: [SuperAdminGuard],  // Protege la ruta solo si el usuario es super administrador
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
