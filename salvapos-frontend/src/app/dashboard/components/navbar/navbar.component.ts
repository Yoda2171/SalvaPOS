import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
export class NavbarComponent implements OnInit {
  public menuItems: any[] = [];
  public userRole: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  isNavbarOpen = true;

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.userRole = currentUser ? currentUser.role : null;

    this.menuItems = routes
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
      .filter((route) => !route.path?.includes('resetpassword'))
      .filter((route) => !route.path?.includes('categoria'))
      .filter((route) => this.isRouteAccessible(route))
      .filter((route) => route.title);
  }

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen; // Alterna entre abierto y cerrado
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private isRouteAccessible(route: any): boolean {
    if (this.userRole === 'Administrador') {
      return true; // Administrador puede acceder a todo
    }

    if (this.userRole === 'Cajero' && route.data?.expectedRole === 'Cajero') {
      return true; // Cajero puede acceder a rutas específicas
    }

    if (
      !this.userRole &&
      ['cart', 'home', 'login', 'resetPassword', 'about'].includes(route.path)
    ) {
      return true; // Usuarios sin rol solo pueden ver inventario, venta, home y login
    }

    return false; // Ocultar otras rutas
  }
}
