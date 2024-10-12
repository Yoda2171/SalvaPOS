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
        /* children: [
          {
            path: 'addproduct',
            loadComponent: () =>
              import(
                './dashboard/pages/inventario/pages/addProducto/addProducto.component'
              ),
          },
        ], */
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
          import('./dashboard/pages/reportes/pages/reporteVenta/reporteVenta.component'),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'addproduct',
    loadComponent: () =>
      import(
        './dashboard/pages/inventario/pages/addProducto/addProducto.component'
      ),
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

  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
];
