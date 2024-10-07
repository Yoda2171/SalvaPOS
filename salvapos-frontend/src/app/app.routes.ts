import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; // Asegúrate de que el componente de Login está importado
import { RegisterComponent } from './register/register.component'; // Asegúrate de que el componente de Registro está importado
import { InventarioComponent } from './inventario/inventario.component'; // Asegúrate de que el componente de Inventario está importado

// Definimos las rutas de la aplicación
export const routes: Routes = [
  { path: 'login', component: LoginComponent },  // Ruta para la página de Login
  { path: 'register', component: RegisterComponent },  // Ruta para la página de Registro
  { path: 'inventario', component: InventarioComponent },  // Ruta para la página de Inventario
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Redirige a Login por defecto
  { path: '**', redirectTo: 'login' }  // Redirige a Login si la ruta no existe
];
