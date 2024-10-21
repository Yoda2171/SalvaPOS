import { Routes } from '@angular/router';

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
      },
      {
        path: 'inventario',
        title: 'Inventario',
        loadComponent: () =>
          import('./dashboard/pages/inventario/inventario.component'),
      },
      {
        path: 'categoria',
        title: 'Categoria',
        loadComponent: () =>
          import('./dashboard/pages/categoria/categoria.component'),
      },
      {
        path: 'addproduct',
        title: 'Addproduct',
        loadComponent: () =>
          import(
            './dashboard/pages/inventario/pages/addProducto/addProducto.component'
          ),
      },
      {
        path: 'editproduct/:id', // Ruta dinámica para editar producto
        title: 'Editproduct',
        loadComponent: () =>
          import(
            './dashboard/pages/inventario/pages/editProducto/editProducto.component'
          ),
      },

      {
        path: 'venta',
        title: 'Venta',
        loadComponent: () => import('./dashboard/pages/venta/venta.component'),
      },
      {
        path: 'reportes',
        title: 'Reportes',
        loadComponent: () =>
          import(
            './dashboard/pages/reportes/pages/reporteVenta/reporteVenta.component'
          ),
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
