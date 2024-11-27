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
import { SoldMetodoPago } from '../../../../Interface/soldProduct.interface';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
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
  selector: 'app-reporte-metodo-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbDatepickerModule],
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
      this.mensajeError = null;
    });
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
      datepicker.close();
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    this.loadMetodoPagoData();
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

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  loadMetodoPagoData(): void {
    const startDate = this.fromDate ? this.formatter.format(this.fromDate) : '';
    const endDate = this.toDate ? this.formatter.format(this.toDate) : '';
    if (!startDate || !endDate) {
      return;
    }

    // Add the last hour, minute, and second to the end date
    const endDateWithTime = `${endDate} 23:59:59`;

    this.ventaService.metodoPagoVendidos(startDate, endDateWithTime).subscribe(
      (data) => {
        this.metodoPagoData = data;
        this.updateChartData();
        this.mensajeError = null;
        this.cdr.detectChanges();
      },
      (error) => {
        this.metodoPagoData = [];
        this.updateChartData();
        this.dateForm.reset();
        this.mensajeError = 'No hay ventas en el rango de fechas ingresado.';
        this.loading$ = new Observable((observer) => {
          observer.next(false);
          observer.complete();
        });
        setTimeout(() => {
          this.mensajeError = null;
          this.cdr.detectChanges();
        }, 3000);

        this.cdr.detectChanges();
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
