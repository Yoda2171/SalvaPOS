import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';  // Asegúrate de tener un servicio que gestione la autenticación

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const userRole = this.authService.getUserRole(); // Método que obtiene el rol del usuario desde el AuthService

        if (userRole === 'superadmin') {
            return true;  // Permite el acceso si el usuario es superadmin
        } else {
            this.router.navigate(['/dashboard']); // Redirige al dashboard si no es superadmin
            return false;  // Bloquea el acceso si el rol no es superadmin
        }
    }
}
