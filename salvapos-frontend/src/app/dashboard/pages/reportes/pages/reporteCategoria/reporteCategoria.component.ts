import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Chart, ChartOptions, ChartType, ChartDataset, registerables } from 'chart.js'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reporte-categoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl:'./reporteCategoria.component.html',
  styleUrl: './reporteCategoria.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteCategoriaComponent implements OnInit {
  public categoryChart: any;
  public chartLabels: string[] = ['Category A', 'Category B', 'Category C', 'Category D'];
  public chartData: ChartDataset<'bar'>[] = [
    {
      data: [120, 150, 180, 100],
      label: 'Items per Category',
      backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 205, 86, 0.6)', 'rgba(153, 102, 255, 0.6)'],
      borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 205, 86, 1)', 'rgba(153, 102, 255, 1)'],
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
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.createChart();
  }

  createChart(): void {
    const chartCanvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (chartCanvas) {
      this.categoryChart = new Chart(chartCanvas, {
        type: this.chartType,
        data: {
          labels: this.chartLabels,
          datasets: this.chartData,
        },
        options: this.chartOptions,
      });
    }
  }
}
