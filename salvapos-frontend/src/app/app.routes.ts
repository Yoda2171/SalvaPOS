import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
//import { HomeComponent } from './home/home.component';//
import { RegisterComponent } from './register/register.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent }, // Ruta para login
  { path: 'registro', component: RegisterComponent }, // Ruta para registro
 // { path: 'home', component: HomeComponent }, // Ruta para home
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirigir al login por defecto
  { path: '**', redirectTo: 'login' } // Redirigir al login si la ruta no existe
];
