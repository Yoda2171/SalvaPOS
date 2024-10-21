import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar-inventario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbarInventario.component.html',
  styleUrl: './navbarInventario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarInventarioComponent {}
