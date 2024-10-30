import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { routes } from '../../../app.routes';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  constructor() {}

  isNavbarOpen = true;

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen; // Alterna entre abierto y cerrado
  }
}
