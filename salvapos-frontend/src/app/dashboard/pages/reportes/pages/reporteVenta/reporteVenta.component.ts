import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaService } from '../../../../../services/venta.service';
import { SoldVenta } from '../../../../Interface/soldProduct.interface';
import { Chart, registerables } from 'chart.js';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-reporte-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reporteVenta.component.html',
  styleUrls: ['./reporteVenta.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteVentaComponent implements OnInit {
  @ViewChild('lineChart') lineChart!: ElementRef<HTMLCanvasElement>;
  ventasData: SoldVenta[] = [];
  chart!: Chart<'line', number[], string> | null; // Permitir null para control explícito
  loading$!: Observable<boolean>;
  dateForm: FormGroup;
  showChart = false; // Inicialmente el gráfico está oculto

  constructor(
    private readonly ventaService: VentaService,
    private readonly fb: FormBuilder
  ) {
    this.dateForm = this.fb.group({
      startDate: [''],
      endDate: [''],
    });
    this.chart = null; // Asegurar que no haya gráfico al inicio
  }

  ngOnInit(): void {
    this.loading$ = this.ventaService.loading$;

    this.dateForm.valueChanges.subscribe(() => {
      this.loadVentasData();
    });
  }

  loadVentasData(): void {
    const { startDate, endDate } = this.dateForm.value;
    if (!startDate || !endDate) {
      return; // No cargar datos si las fechas no están seleccionadas
    }

    // Inicializar el gráfico antes de solicitar los datos
    this.initializeChart();

    this.ventaService.ventasVendidas(startDate, endDate).subscribe((data) => {
      this.ventasData = data;
      this.updateChartData();
      this.showChart = true; // Muestra el gráfico después de recibir los datos
    });
  }

  initializeChart(): void {
    // Verificar si ya existe un gráfico y destruirlo
    if (this.chart) {
      this.chart.destroy();
      this.chart = null; // Asegurar referencia limpia
    }

    const context = this.lineChart.nativeElement.getContext('2d');
    if (context) {
      this.chart = new Chart(context, {
        type: 'line',
        data: {
          labels: [], // Inicial vacío
          datasets: [
            {
              label: 'Total Vendido',
              data: [], // Inicial vacío
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    } else {
      console.error('No se pudo obtener el contexto del canvas.');
    }
  }

  updateChartData(): void {
    if (this.chart) {
      // Actualiza las etiquetas y los datos
      this.chart.data.labels = this.ventasData.map((venta) =>
        this.formatDate(venta.fechaVenta)
      );
      this.chart.data.datasets[0].data = this.ventasData.map(
        (venta) => venta.totalVendido
      );
      this.chart.update();
    }
  }

  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Formateo con puntos como separadores de miles
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }
}
