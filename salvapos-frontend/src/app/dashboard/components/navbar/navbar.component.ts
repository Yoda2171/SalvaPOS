import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { routes } from '../../../app.routes';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  public menuItems = routes
    .map((route) => route.children ?? [])
    .flat()
    .filter((route) => route?.path)
    .filter((route) => !route.path?.includes(':'))
    .filter((route) => !route.path?.includes('addproduct'))
    .filter((route) => !route.path?.includes('historialventa'))
    .filter((route) => !route.path?.includes('reportesinvetario'))
    .filter((route) => !route.path?.includes('reportesventa'))
    .filter((route) => !route.path?.includes('reportescategoria'))
    .filter((route) => !route.path?.includes('reportesmetodopago'))
    .filter((route) => !route.path?.includes('categoria'))
    .filter((route) => route.title);

  public userRole: string = ''; // Para almacenar el rol del usuario
  isNavbarOpen = true;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    // Obtener el rol del usuario del localStorage
    const user = this.authService.getCurrentUser();
    this.userRole = user?.role || '';
  }

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen; // Alterna entre abierto y cerrado
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Método para determinar si el usuario es superadministrador
  isSuperAdmin() {
    return this.userRole === 'Administrador'; // Suponiendo que el rol se guarda como 'superadmin'
  }

  // Método para determinar si el usuario es farmacéutico (cajero)
  isPharmacist() {
    return this.userRole === 'Cajero'; // Suponiendo que el rol se guarda como 'pharmacist'
  }
}
