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
  styleUrl: './navbar.component.css',
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

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  isNavbarOpen = true;

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen; // Alterna entre abierto y cerrado
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
