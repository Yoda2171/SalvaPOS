import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-reporte-venta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporteVenta.component.html',
  styleUrl: './reporteVenta.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteVentaComponent {}
