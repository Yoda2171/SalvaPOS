import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verifica si hay un token de usuario en el localStorage
    const isAuthenticated = !!localStorage.getItem('token');

    if (isAuthenticated) {
      return true;  // Permite el acceso si el usuario está autenticado
    } else {
      this.router.navigate(['/login']);  // Redirige al login si no está autenticado
      return false;
    }
  }
}
