import {
  ChangeDetectionStrategy,
  Component,
  AfterViewInit,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaService } from '../../../../../services/venta.service';
import { SoldMetodoPago } from '../../../../Interface/soldProduct.interface';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { error } from 'node:console';

Chart.register(...registerables);

@Component({
  selector: 'app-reporte-metodo-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reporteMetodoPago.component.html',
  styleUrls: ['./reporteMetodoPago.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteMetodoPagoComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;
  metodoPagoData: SoldMetodoPago[] = [];
  chart!: Chart<'pie', number[], string>;
  loading$!: Observable<boolean>;
  dateForm: FormGroup;

  constructor(
    private readonly ventaService: VentaService,
    private readonly fb: FormBuilder
  ) {
    this.dateForm = this.fb.group({
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    this.loading$ = this.ventaService.loading$;

    this.dateForm.valueChanges.subscribe(() => {
      this.loadMetodoPagoData();
    });
  }

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  loadMetodoPagoData(): void {
    const { startDate, endDate } = this.dateForm.value;
    if (!startDate || !endDate) {
      return; // No cargar datos si las fechas no están seleccionadas
    }

    this.ventaService.metodoPagoVendidos(startDate, endDate).subscribe(
      (data) => {
        this.metodoPagoData = data;
        this.updateChartData();
      },
      (error) => {
        alert('Error al cargar los datos de métodos de pago');
        this.dateForm.reset(); // Limpiar formulario
        console.error('Error al cargar los datos de métodos de pago', error);
      }
    );
  }

  initializeChart(): void {
    const context = this.barChart.nativeElement.getContext('2d');
    if (context) {
      // Configuración inicial del gráfico
      const chartData: ChartData<'pie', number[], string> = {
        labels: this.metodoPagoData.map((item) => item.nombreMetodoPago), // Inicial con métodos de pago
        datasets: [
          {
            label: 'Total Vendido',
            data: this.metodoPagoData.map((item) => item.totalVendido), // Datos iniciales
            backgroundColor: [
              'rgba(75, 192, 192, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };

      const config: ChartConfiguration<'pie', number[], string> = {
        type: 'pie',
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        },
      };

      // Inicialización del gráfico
      this.chart = new Chart(context, config);
    } else {
      console.error('No se pudo obtener el contexto del canvas.');
    }
  }

  updateChartData(): void {
    if (this.chart) {
      // Actualización de etiquetas y datos
      this.chart.data.labels = this.metodoPagoData.map(
        (item) => item.nombreMetodoPago
      );
      this.chart.data.datasets[0].data = this.metodoPagoData.map(
        (item) => item.totalVendido
      );
      this.chart.update();
    } else {
      console.warn('El gráfico aún no ha sido inicializado.');
    }
  }

  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Formateo con puntos como separadores de miles
  }
}
