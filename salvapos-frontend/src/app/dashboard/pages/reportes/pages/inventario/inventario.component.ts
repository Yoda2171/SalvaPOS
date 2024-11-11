import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Chart, ChartOptions, ChartType, ChartDataset, registerables } from 'chart.js'; // Asegúrate de incluir registerables
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'], // Corrección: Usa "styleUrls" en plural
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventoryReportComponent implements OnInit {
  public inventoryChart: any;
  public chartLabels: string[] = [
    'Product A',
    'Product B',
    'Product C',
    'Product D',
  ];
  public chartData: ChartDataset<'bar'>[] = [
    {
      data: [50, 30, 70, 40],
      label: 'Stock Quantity',
      backgroundColor: ['rgba(75, 192, 192, 0.2)'],
      borderColor: ['rgba(75, 192, 192, 1)'],
      borderWidth: 1,
    },
  ];
  public chartType: ChartType = 'bar';
  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Asegura que el gráfico se ajuste al contenedor
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  public selectedDate: string = '';

  constructor() {
    // Registra todos los componentes de Chart.js, necesarios en la versión 3 y superior
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.createChart();
  }

  createChart(): void {
    const chartCanvas = document.getElementById('inventoryChart') as HTMLCanvasElement;
    if (chartCanvas) {
      this.inventoryChart = new Chart(chartCanvas, {
        type: this.chartType,
        data: {
          labels: this.chartLabels,
          datasets: this.chartData,
        },
        options: this.chartOptions,
      });
    }
  }

  onDateChange(event: any): void {
    this.selectedDate = event.target.value;
    console.log('Fecha seleccionada:', this.selectedDate);
    this.updateReportData(this.selectedDate);
  }

  updateReportData(date: string): void {
    console.log(`Actualizando datos para la fecha: ${date}`);
    // Lógica para actualizar el gráfico y la tabla según la fecha seleccionada
  }
}
