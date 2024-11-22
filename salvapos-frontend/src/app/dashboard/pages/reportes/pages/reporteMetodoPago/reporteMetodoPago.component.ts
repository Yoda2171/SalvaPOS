import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Chart, ChartOptions, ChartType, ChartDataset, registerables } from 'chart.js'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reporte-metodo-pago',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporteMetodoPago.component.html',
  styleUrls: ['./reporteMetodoPago.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteMetodoPagoComponent implements OnInit {
  public paymentMethodChart: any;
  public chartLabels: string[] = ['Tarjeta de Crédito', 'Tarjeta de Débito', 'Efectivo'];
  public chartData: ChartDataset<'pie'>[] = [
    {
      data: [150, 120, 80],
      label: 'Total de Pagos',
      backgroundColor: ['#36a2eb', '#ffcd56', '#ff6384'],
    },
  ];
  public chartType: ChartType = 'pie';
  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  public startDate: string = '';
  public endDate: string = '';
  public loading: boolean = false;

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.createChart();
  }

  // Crear el gráfico
  createChart(): void {
    const chartCanvas = document.getElementById('paymentMethodChart') as HTMLCanvasElement;
    if (chartCanvas) {
      this.paymentMethodChart = new Chart(chartCanvas, {
        type: this.chartType,
        data: {
          labels: this.chartLabels,
          datasets: this.chartData,
        },
        options: this.chartOptions,
      });
    }
  }

  // Manejar el cambio de fecha y actualizar los datos del reporte
  onDateChange(event: any, type: string): void {
    if (type === 'start') {
      this.startDate = event.target.value;
    } else if (type === 'end') {
      this.endDate = event.target.value;
    }
    console.log('Fecha de inicio:', this.startDate);
    console.log('Fecha de fin:', this.endDate);
    this.updateChartData();
  }

  // Actualizar los datos del gráfico
  updateChartData(): void {
    // Actualizar datos con base en el rango de fechas seleccionado
    console.log(`Datos actualizados desde ${this.startDate} hasta ${this.endDate}`);
    this.chartData = [
      {
        data: [180, 140, 100], // Nuevos datos simulados
        label: 'Total de Pagos',
        backgroundColor: ['#36a2eb', '#ffcd56', '#ff6384'],
      },
    ];
    this.paymentMethodChart.update();
  }
}
