import {
  ChangeDetectionStrategy,
  Component,
  AfterViewInit,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaService } from '../../../../../services/venta.service';
import { SoldProductDto } from '../../../../Interface/soldProduct.interface';
import { Chart, ChartData, ChartConfiguration, registerables } from 'chart.js';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDatepickerModule,
} from '@ng-bootstrap/ng-bootstrap';

Chart.register(...registerables);

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbDatepickerModule],
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
  noSalesAlert = false;

  calendar = inject(NgbCalendar);
  formatter = inject(NgbDateParserFormatter);

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null;
  toDate: NgbDate | null;
  mensajeError: string | null = null;

  constructor(
    private readonly ventaService: VentaService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    const today = this.calendar.getToday();
    this.fromDate = this.calendar.getPrev(today, 'm', 1);
    this.toDate = today;

    this.dateForm = this.fb.group({
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    this.loading$ = this.ventaService.loading$;

    this.dateForm.valueChanges.subscribe(() => {
      this.noSalesAlert = false;
    });
  }

  ngAfterViewInit(): void {
    if (this.barChart) {
      this.initializeChart();
    } else {
      console.warn('El elemento canvas no está disponible en el DOM.');
    }
  }

  onDateSelection(date: NgbDate, datepicker: any) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      date.after(this.fromDate)
    ) {
      this.toDate = date;
      datepicker.close(); // Cierra el calendario al seleccionar la segunda fecha
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    this.loadSoldProducts();
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  isDisabled = (date: NgbDate) => date.after(this.calendar.getToday());

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : currentValue;
  }

  loadSoldProducts(): void {
    const startDate = this.fromDate ? this.formatter.format(this.fromDate) : '';
    const endDate = this.toDate ? this.formatter.format(this.toDate) : '';
    if (!startDate || !endDate) {
      return;
    }

    const endDateWithTime = `${endDate} 23:59:59`;

    this.ventaService.productosVendidos(startDate, endDateWithTime).subscribe({
      next: (data) => {
        this.soldProducts = data;
        this.updateChartData();
        this.mensajeError = null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.mensajeError = 'No hay ventas en el rango de fechas ingresado.';

        this.loading$ = new Observable((observer) => {
          observer.next(false);
          observer.complete();
        });
        setTimeout(() => {
          this.mensajeError = null;
          this.cdr.detectChanges();
        }, 3000);
        this.soldProducts = [];
        this.updateChartData();
        this.dateForm.reset();
        this.cdr.detectChanges();
      },
    });
  }

  initializeChart(): void {
    const context = this.barChart.nativeElement.getContext('2d');
    if (context) {
      const chartData: ChartData<'pie', number[], string> = {
        labels: this.soldProducts.map((product) => product.nombreProducto),
        datasets: [
          {
            label: 'Cantidad Total Vendida',
            data: this.soldProducts.map(
              (product) => product.cantidadTotalVendida
            ),
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

      this.chart = new Chart(context, config);
    } else {
      console.error('No se pudo obtener el contexto del canvas.');
    }
  }

  updateChartData(): void {
    if (this.chart) {
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

  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}
