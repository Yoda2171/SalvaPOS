import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaService } from '../../../../../services/venta.service';
import { SoldVenta } from '../../../../Interface/soldProduct.interface';
import { Chart, registerables } from 'chart.js';
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
  selector: 'app-reporte-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbDatepickerModule],
  templateUrl: './reporteVenta.component.html',
  styleUrls: ['./reporteVenta.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReporteVentaComponent implements OnInit {
  @ViewChild('lineChart') lineChart!: ElementRef<HTMLCanvasElement>;
  ventasData: SoldVenta[] = [];
  chart!: Chart<'line', number[], string> | null;
  loading$!: Observable<boolean>;
  dateForm: FormGroup;
  showChart = false;

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
    this.chart = null;
  }

  ngOnInit(): void {
    this.loading$ = this.ventaService.loading$;

    this.dateForm.valueChanges.subscribe(() => {
      this.showChart = false;
      this.mensajeError = null;
    });
  }

  onDateSelection(date: NgbDate, datepicker: any): void {
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
    this.loadVentasData();
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

  loadVentasData(): void {
    const startDate = this.fromDate ? this.formatter.format(this.fromDate) : '';
    const endDate = this.toDate ? this.formatter.format(this.toDate) : '';
    if (!startDate || !endDate) {
      return;
    }

    // Add the last hour, minute, and second to the end date
    const endDateWithTime = `${endDate} 23:59:59`;

    this.ventaService.ventasVendidas(startDate, endDateWithTime).subscribe(
      (data) => {
        this.initializeChart();
        this.ventasData = data;
        this.updateChartData();
        this.showChart = true;
        this.mensajeError = null;
        this.cdr.detectChanges();
      },
      (error) => {
        this.chart?.destroy();
        this.ventasData = [];
        this.showChart = false;
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
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const context = this.lineChart.nativeElement.getContext('2d');
    if (context) {
      this.chart = new Chart(context, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Total Vendido',
              data: [],
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    } else {
      console.error('No se pudo obtener el contexto del canvas.');
    }
  }

  updateChartData(): void {
    if (this.chart) {
      this.chart.data.labels = this.ventasData.map((venta) =>
        this.formatDate(venta.fechaVenta)
      );
      this.chart.data.datasets[0].data = this.ventasData.map(
        (venta) => venta.totalVendido
      );
      this.chart.update();
    }
  }

  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }
}
