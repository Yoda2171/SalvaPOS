import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Chart, ChartOptions, ChartType, ChartDataset } from 'chart.js'; // Ajustar las importaciones correctas
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css',
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
      backgroundColor: ['rgba(75, 192, 192, 0.2)'], // Personaliza el color de fondo
      borderColor: ['rgba(75, 192, 192, 1)'], // Personaliza el color del borde
      borderWidth: 1,
    },
  ];
  public chartType: ChartType = 'bar'; // Tipo de gráfico
  public chartOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  constructor() {}

  ngOnInit(): void {
    this.createChart();
  }

  createChart(): void {
    this.inventoryChart = new Chart('inventoryChart', {
      type: this.chartType,
      data: {
        labels: this.chartLabels,
        datasets: this.chartData,
      },
      options: this.chartOptions,
    });
  }
}
