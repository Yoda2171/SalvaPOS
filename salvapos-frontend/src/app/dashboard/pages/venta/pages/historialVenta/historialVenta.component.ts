import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { NavabarVentaComponent } from '../../../../components/navabarVenta/navabarVenta.component';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../../../../services/venta.service';
import { Observable } from 'rxjs';
import { ImpresoraService } from '../../../../../services/impresora.service';

@Component({
  selector: 'app-historial-venta',
  standalone: true,
  imports: [CommonModule, NavabarVentaComponent, FormsModule],
  templateUrl: './historialVenta.component.html',
  styleUrl: './historialVenta.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HistorialVentaComponent implements AfterViewInit {
  searchTerm: string = '';
  selectedDate: string = ''; // Formato ISO para el input de fecha
  internalDate: string = '';
  ventas: any[] = []; // Lista de ventas para mostrar
  ventaSeleccionada: any = null;
  loading$: Observable<boolean>;

  @ViewChild('confirmDevolucionModal') confirmDevolucionModal!: ElementRef;
  @ViewChild('successToast') successToast!: ElementRef; // Referencia al toast
  private bootstrapModalInstance: any; // Instancia persistente del modal
  private successToastInstance: any; // Instancia persistente del toast

  constructor(
    private readonly ventaService: VentaService,
    private readonly impresoraService: ImpresoraService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    this.loading$ = this.ventaService.loading$;
  }

  ngOnInit(): void {
    this.setToday(); // Cargar ventas del día actual al iniciar
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Crear instancia persistente del modal después de que el elemento esté disponible
      const modalElement = this.confirmDevolucionModal.nativeElement;
      this.bootstrapModalInstance = new window.bootstrap.Modal(modalElement);

      // Crear instancia persistente del toast después de que el elemento esté disponible
      const toastElement = this.successToast.nativeElement;
      this.successToastInstance = new window.bootstrap.Toast(toastElement);
    }
  }

  buscarVentas(): void {
    console.log(`Buscar ventas por fecha: ${this.selectedDate}`);
    this.ventaService
      .obtenerVentasPorFecha(this.selectedDate)
      .subscribe((ventas) => {
        this.ventas = ventas;
      });
  }

  onDateChange(newDate: string): void {
    if (newDate) {
      // Convierte la fecha de YYYY-MM-DD a DD/MM/YYYY
      const [year, month, day] = newDate.split('-');
      this.selectedDate = `${day}/${month}/${year}`;
      this.buscarVentas();
    }
  }

  setToday() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    this.internalDate = `${year}-${month}-${day}`;
    this.selectedDate = `${day}/${month}/${year}`;
    this.buscarVentas();
  }

  seleccionarVenta(venta: any): void {
    console.log('Venta seleccionada:', venta);
    this.ventaSeleccionada = venta;
  }

  mostrarConfirmacionDevolucion(): void {
    this.bootstrapModalInstance?.show();
  }

  mostrarToastDevolucionExitosa(): void {
    this.successToastInstance?.show();
  }

  confirmarDevolucionVenta(): void {
    if (this.ventaSeleccionada) {
      this.ventaService.devolucionVenta(this.ventaSeleccionada.id).subscribe({
        next: () => {
          // Mostrar el toast de éxito
          this.mostrarToastDevolucionExitosa();

          // Ocultar el modal de confirmación
          this.bootstrapModalInstance?.hide();

          // Actualizar la lista de ventas y limpiar la selección
          this.buscarVentas();
          this.ventaSeleccionada = null;
        },
        error: (err) => {
          console.error('Error al devolver la venta:', err);
          alert('Hubo un error al procesar la devolución. Intente nuevamente.');
        },
      });
    }
  }

  imprimirBoleta(): void {
    const contenidoBoleta = this.generarContenidoBoleta(); // Genera el contenido formateado
    const nombreImpresora = 'ImpresoraTermica'; // Reemplaza con el nombre real de la impresora

    this.impresoraService
      .imprimirBoleta(nombreImpresora, contenidoBoleta)
      .catch((error) => {
        console.error('Error al imprimir la boleta:', error);
        alert('Hubo un error al intentar imprimir la boleta.');
      });
  }

  private generarContenidoBoleta(): string {
    console.log(this.ventaSeleccionada);
    const encabezado = `R.U.T.: 77.163.978-K\nBOLETA ELECTRONICA\n\nINVERSIONES C&C SPA\nVENTA AL POR MENOR DE PRODUCTOS FARMACEUTICOS\nAV SIMON BOLIVAR 4109 MAIPU\n\n`;

    const fechaObjeto = new Date(this.ventaSeleccionada.fecha);
    const fechaFormateada = fechaObjeto.toLocaleDateString('es-CL');
    const horaFormateada = fechaObjeto.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const fecha = `Emision: ${fechaFormateada} ${horaFormateada}\n\n`;

    const idVenta = `Ticket: ${this.ventaSeleccionada.id}\n\n`;
    const items = this.ventaSeleccionada.detalles
      .map(
        (item: any) =>
          `${item.producto.nombre}\t${item.cantidad} x ${this.formatCurrency(
            item.precioUnitario
          )}\t${this.formatCurrency(item.subtotal)}`
      )
      .join('\n');
    const total = `\nNeto: ${this.formatCurrency(
      Math.floor(this.ventaSeleccionada.total * 0.81)
    )}\nIVA: ${this.formatCurrency(
      Math.floor(this.ventaSeleccionada.total * 0.19)
    )}\nTotal: ${this.formatCurrency(this.ventaSeleccionada.total)}\n`;

    return `${encabezado}${fecha}${idVenta}${items}${total}`;
  }

  // Formatea el valor de entrada a formato moneda
  formatCurrency(value: number | null): string {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
  }
}
