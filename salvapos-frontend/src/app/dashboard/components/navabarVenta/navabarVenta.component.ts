import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navabar-venta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navabarVenta.component.html',
  styleUrl: './navabarVenta.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavabarVentaComponent {}
