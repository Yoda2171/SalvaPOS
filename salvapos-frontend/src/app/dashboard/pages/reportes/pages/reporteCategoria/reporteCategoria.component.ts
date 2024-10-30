import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-reporte-categoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporteCategoria.component.html',
  styleUrl: './reporteCategoria.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteCategoriaComponent {}
