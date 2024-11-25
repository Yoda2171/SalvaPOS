import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Asegúrate de tener un servicio de autenticación

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const expectedRole = route.data['expectedRole'];
    const userRole = this.authService.getCurrentUser(); // Método para obtener el rol del usuario actual

    if (!userRole) {
      // Si no tiene rol, redirigir a la página de inventario
      return this.router.createUrlTree(['/login']);
    }

    if (userRole.role === 'Administrador') {
      return true; // Administrador puede acceder a todo
    }

    if (userRole.role === expectedRole) {
      return true; // Rol específico puede acceder
    }

    // Redirigir a la página de inventario si no tiene permisos
    return this.router.createUrlTree(['/dashboard/home']);
  }
}
