import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Chart, ChartOptions, ChartType, ChartDataset, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventoryReportComponent implements OnInit {
  public inventoryChart: any;
  public chartLabels: string[] = ['Product A', 'Product B', 'Product C', 'Product D'];
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
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Variables para el rango de fechas
  public startDate: string = '';
  public endDate: string = '';
  public loading: boolean = false;

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

  onDateChange(event: any, type: string): void {
    if (type === 'start') {
      this.startDate = event.target.value;
    } else if (type === 'end') {
      this.endDate = event.target.value;
    }

    if (this.startDate && this.endDate && new Date(this.startDate) > new Date(this.endDate)) {
      alert("La fecha de inicio no puede ser mayor a la fecha de fin.");
      return;
    }

    console.log('Fecha de inicio:', this.startDate);
    console.log('Fecha de fin:', this.endDate);

    this.updateReportData(this.startDate, this.endDate);
  }

  updateReportData(startDate: string, endDate: string): void {
    console.log(`Actualizando datos para el rango de fechas: ${startDate} a ${endDate}`);
    // Aquí debes filtrar los datos según las fechas seleccionadas.
    // A modo de ejemplo, cambiaré los datos aleatoriamente.

    this.chartData = [
      {
        data: [
          Math.random() * 100, 
          Math.random() * 100, 
          Math.random() * 100, 
          Math.random() * 100
        ], 
        label: 'Stock Quantity',
        backgroundColor: ['rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ];
    this.inventoryChart.update(); // Actualizar el gráfico con los nuevos datos
  }
}
