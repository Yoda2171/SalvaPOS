import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; 
import { RegisterComponent } from './register/register.component'; 
import { InventarioComponent } from './inventario/inventario.component'; 


// Definimos las rutas de la aplicación
export const routes: Routes = [
  { path: 'login', component: LoginComponent },  
  { path: 'register', component: RegisterComponent }, 
  { path: 'inventario', component: InventarioComponent },  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  
  { path: '**', redirectTo: 'login' }  
];
