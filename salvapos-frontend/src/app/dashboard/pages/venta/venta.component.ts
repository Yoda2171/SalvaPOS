import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './venta.component.html',
  styleUrl: './venta.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VentaComponent {}
