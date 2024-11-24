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
import { SoldProductDto } from '../../../../Interface/soldProduct.interface';
import { Chart, ChartData, ChartConfiguration, registerables } from 'chart.js';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventoryReportComponent implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;
  soldProducts: SoldProductDto[] = [];
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
      this.loadSoldProducts();
    });
  }

  ngAfterViewInit(): void {
    if (this.barChart) {
      this.initializeChart();
    } else {
      console.warn('El elemento canvas no está disponible en el DOM.');
    }
  }

  loadSoldProducts(): void {
    const { startDate, endDate } = this.dateForm.value;
    if (!startDate || !endDate) {
      return; // No cargar datos si las fechas no están seleccionadas
    }

    this.ventaService
      .productosVendidos(startDate, endDate)
      .subscribe((data) => {
        this.soldProducts = data;
        this.updateChartData();
      });
  }

  initializeChart(): void {
    const context = this.barChart.nativeElement.getContext('2d');
    if (context) {
      // Configuración inicial del gráfico
      const chartData: ChartData<'pie', number[], string> = {
        labels: this.soldProducts.map((product) => product.nombreProducto), // Inicial con productos
        datasets: [
          {
            label: 'Cantidad Total Vendida',
            data: this.soldProducts.map(
              (product) => product.cantidadTotalVendida
            ), // Datos iniciales
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
      this.chart.data.labels = this.soldProducts.map(
        (product) => product.nombreProducto
      );
      this.chart.data.datasets[0].data = this.soldProducts.map(
        (product) => product.cantidadTotalVendida
      );
      this.chart.update();
    } else {
      console.warn('El gráfico aún no ha sido inicializado.');
    }
  }
}
