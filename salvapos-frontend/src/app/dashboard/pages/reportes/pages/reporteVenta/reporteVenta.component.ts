import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-reporte-venta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporteVenta.component.html',
  styleUrl: './reporteVenta.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteVentaComponent {
  salesData = [
    { id: 'V001', date: '01 Dec 2023', category: 'Medicine', amount: 150, quantity: 100 },
    { id: 'V002', date: '08 Dec 2023', category: 'Medicine', amount: 200, quantity: 120 },
    { id: 'V003', date: '15 Dec 2023', category: 'Equipment', amount: 100, quantity: 60 },
    { id: 'V004', date: '20 Dec 2023', category: 'Medicine', amount: 175, quantity: 80 },
    { id: 'V005', date: '31 Dec 2023', category: 'Equipment', amount: 300, quantity: 152 }
  ];

  @ViewChild('salesChart') salesChart!: ElementRef<HTMLCanvasElement>;

  constructor() {
    Chart.register(...registerables);  // Registrar Chart.js
  }

  ngAfterViewInit() {
    const categories = this.salesData.reduce((acc, sale) => {
      acc[sale.category] = (acc[sale.category] || 0) + sale.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryLabels = Object.keys(categories);
    const categoryData = Object.values(categories);

    // Renderizar el gráfico de dona
    if (this.salesChart && this.salesChart.nativeElement) {
      new Chart(this.salesChart.nativeElement, {
        type: 'doughnut',
        data: {
          labels: categoryLabels,
          datasets: [{
            label: 'Sales Amount by Category',
            data: categoryData,
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',  // Color categoría 1
              'rgba(255, 99, 132, 0.7)'   // Color categoría 2
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,  // Permitir que el gráfico cambie de tamaño según el contenedor
          aspectRatio: 2,              // Relación de aspecto (puedes ajustarla a lo que desees)
          plugins: {
            legend: {
              display: true,
              position: 'bottom'  // Leyenda en la parte inferior
            }
          }
        }
      });
    } else {
      console.error('Error: No se encontró el canvas');
    }
  }
}
