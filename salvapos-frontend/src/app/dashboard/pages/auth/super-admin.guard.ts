import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Verifica si el usuario es un superadministrador
    const userRole = localStorage.getItem('userRole'); // Suponiendo que guardas el rol en el localStorage

    if (userRole === 'superadmin') {
      return true; // Si es superadministrador, deja pasar
    } else {
      this.router.navigate(['/dashboard/home']); // Si no es superadministrador, redirige a la home
      return false;
    }
  }
}
