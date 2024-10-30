import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-reporte-metodo-pago',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporteMetodoPago.component.html',
  styleUrl: './reporteMetodoPago.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteMetodoPagoComponent {}
