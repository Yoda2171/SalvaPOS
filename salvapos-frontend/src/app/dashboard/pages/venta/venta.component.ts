import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MetodoPago } from '../../Interface/metodoPago.interface';
import {
  Pago,
  DetalleVenta,
  Producto,
  VentaAPI,
  Ventaboleta,
  Venta,
} from '../../Interface/venta.interface';
import { VentaService } from '../../../services/venta.service';
import { Router, RouterModule } from '@angular/router';
import ReporteVentaComponent from '../reportes/pages/reporteVenta/reporteVenta.component';
import { NavabarVentaComponent } from '../../components/navabarVenta/navabarVenta.component';
import { ImpresoraService } from '../../../services/impresora.service';

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReporteVentaComponent,
    NavabarVentaComponent,
  ],
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
})
export default class VentaComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  // Variables públicas
  router = inject(Router);
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('stockToast', { static: true }) stockToast!: ElementRef;
  @ViewChild('successToast', { static: true }) successToast!: ElementRef;
  @ViewChild('detalleVentaModal', { static: true })
  detalleVentaModal!: ElementRef;

  carrito: DetalleVenta[] = [];
  searchTerm: string = '';
  productosEncontrados: any[] = [];
  pago: Pago[] = [];
  metodosDisponibles: MetodoPago[] = [
    { id: 1, nombre: 'Efectivo' },
    { id: 2, nombre: 'Tarjeta de debito' },
    { id: 3, nombre: 'Transferencia' },
    { id: 4, nombre: 'Cheque' },
    { id: 5, nombre: 'Tarjeta de credito' },
  ];
  loading$: Observable<boolean>;

  // Variables privadas
  private toastInstance: any;
  private successToastInstance: any;
  private modalInstance: any;

  alertaError: string | null = null;
  private ventaId: any;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly productoService: ProductoService,
    private readonly ventaService: VentaService,
    private readonly impresoraService: ImpresoraService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    this.loading$ = this.productoService.loading$;
  }

  // Ciclo de vida del componente
  ngOnInit(): void {
    this.focusSearchInput();
    this.agregarMetodoPago();
  }

  ngAfterViewInit(): void {
    this.initializeBootstrapComponents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.devolverStock();
  }

  // Inicialización de Bootstrap
  private initializeBootstrapComponents(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('bootstrap').then((bootstrap) => {
        this.toastInstance = this.initializeToast(bootstrap, this.stockToast);
        this.successToastInstance = this.initializeToast(
          bootstrap,
          this.successToast
        );
        this.modalInstance = this.initializeModal(
          bootstrap,
          this.detalleVentaModal
        );
      });
    }
  }

  private initializeToast(bootstrap: any, elementRef: ElementRef): any {
    if (elementRef && elementRef.nativeElement) {
      try {
        return new bootstrap.Toast(elementRef.nativeElement);
      } catch (error) {
        console.error('Error al inicializar el toast:', error);
      }
    }
    return null;
  }

  private initializeModal(bootstrap: any, elementRef: ElementRef): any {
    if (elementRef && elementRef.nativeElement) {
      try {
        return new bootstrap.Modal(elementRef.nativeElement);
      } catch (error) {
        console.error('Error al inicializar el modal:', error);
      }
    }
    return null;
  }

  private mostrarErrorAlert(mensaje: string) {
    this.alertaError = mensaje;

    setTimeout(() => {
      this.cerrarMensajeError();
    }, 5000);
  }

  // Métodos de Toast y Modal
  mostrarSuccessToast(): void {
    if (this.successToastInstance) {
      this.successToastInstance.show();
    }
  }

  mostrarToast(): void {
    if (this.toastInstance) {
      this.toastInstance.show();
    }
  }

  mostrarModalDetalleVenta(): void {
    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }

  // Manejo de Stock
  devolverStock(): void {
    this.carrito.forEach((item) => {
      if (item.cantidad > 0) {
        this.productoService
          .ajustarStock(item.producto.id, item.cantidad)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            error: (err) => console.error('Error al devolver el stock:', err),
          });
      }
    });
  }

  // Búsqueda de productos
  buscarProductos(): void {
    if (this.searchTerm.trim() === '') {
      this.productosEncontrados = [];
      return;
    }

    this.productoService
      .getProductos(this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.productosEncontrados = response.data;
          if (this.productosEncontrados.length === 1) {
            this.agregarAlCarrito(this.productosEncontrados[0]);
          }
          this.focusSearchInput();
        },
        error: (error) => {
          console.error('Error al buscar productos:', error);
          this.focusSearchInput();
        },
      });
  }

  // Manejo del Carrito
  agregarAlCarrito(producto: Producto): void {
    const itemExistente = this.carrito.find(
      (item) => item.producto.id === producto.id
    );

    if (itemExistente) {
      this.incrementarCantidad(itemExistente, producto);
    } else if (producto.cantidad > 0) {
      const nuevoItem: DetalleVenta = {
        producto,
        cantidad: 1,
        precioUnitario: producto.precioVenta,
        subtotal: producto.precioVenta,
      };
      producto.cantidad--; // Reducir el stock disponible
      this.carrito.push(nuevoItem);
      this.productoService
        .ajustarStock(producto.id, -1)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    } else {
      this.mostrarToast(); // Mostrar toast si el producto está fuera de stock
    }

    this.productosEncontrados = [];
    this.searchTerm = '';
    this.focusSearchInput();
  }

  incrementarCantidad(item: DetalleVenta, producto: Producto): void {
    if (producto.cantidad > 0) {
      item.cantidad++;
      item.producto.cantidad--;
      item.subtotal = item.cantidad * item.precioUnitario;
      this.productoService
        .ajustarStock(producto.id, -1)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    } else {
      this.mostrarToast();
    }
  }

  disminuirCantidad(item: DetalleVenta): void {
    if (item.cantidad > 1) {
      item.cantidad--;
      item.producto.cantidad++;
      item.subtotal = item.cantidad * item.precioUnitario;
      this.productoService
        .ajustarStock(item.producto.id, 1)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
    this.focusSearchInput();
  }

  eliminarItem(item: DetalleVenta): void {
    this.productoService
      .ajustarStock(item.producto.id, item.cantidad)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    item.producto.cantidad += item.cantidad;
    this.carrito = this.carrito.filter((i) => i !== item);
    this.focusSearchInput();
  }

  // Procesar Venta
  calcularTotal(): number {
    return this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  irDetalleCompra(): void {
    const total = this.calcularTotal();
    const totalPagado = this.pago.reduce(
      (acc, pago) => acc + (pago.monto ?? 0),
      0
    );

    if (this.validarMetodoPago(totalPagado, total)) {
      this.mostrarModalDetalleVenta();
    }
  }

  realizarVenta(): void {
    const venta: VentaAPI = {
      total: this.calcularTotal(),
      detalles: this.carrito.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      })),
      pagos: this.pago.map((pago) => ({
        metodoPagoId: this.obtenerMetodoPagoId(pago.metodoPago.nombre),
        monto: pago.monto ?? 0,
      })),
    };

    this.ventaService.createVenta(venta).subscribe({
      next: (respuestaVenta: Venta) => {
        this.ventaId = respuestaVenta.id; // Almacenar el ID de la venta
        this.imprimirBoleta();
        this.modalInstance.hide();
        this.resetFormulario(); // Llama al método para imprimir la boleta después de realizar la venta
      },
      error: (error) => {
        console.error('Error al realizar la venta:', error);
        alert('Hubo un error al procesar la venta.');
      },
    });
  }
  // Métodos de Validación
  private validarMetodoPago(totalPagado: number, total: number): boolean {
    if (
      this.pago.length === 0 ||
      this.pago.some((pago) => (pago.monto ?? 0) <= 0)
    ) {
      this.mostrarErrorAlert(
        'Debe seleccionar un método de pago y asegurarse de que el monto sea mayor a 0.'
      );
      return false;
    }
    if (this.pago.some((pago) => pago.metodoPago.nombre === '')) {
      this.mostrarErrorAlert('Debe seleccionar un método de pago.');
      return false;
    }

    if (totalPagado < total) {
      this.mostrarErrorAlert(
        `El total a pagar es $${total}, pero solo se han ingresado $${totalPagado}.`
      );
      return false;
    }

    return true;
  }

  // Métodos adicionales
  agregarMetodoPago(): void {
    this.pago.push({ monto: null, metodoPago: { nombre: '' } });
  }

  eliminarMetodoPago(index: number): void {
    this.pago.splice(index, 1);
  }

  resetFormulario(): void {
    this.pago = [];
    this.carrito = [];
    this.searchTerm = '';
    this.ventaId = null;
    this.productosEncontrados = [];
    this.focusSearchInput();
    this.cdr.detectChanges(); // Vuelve a enfocar el input de búsqueda
  }

  cerrarMensajeError() {
    this.alertaError = null;
    this.cdr.detectChanges();
  }

  private focusSearchInput(): void {
    setTimeout(() => {
      if (this.searchInput && this.searchInput.nativeElement) {
        this.searchInput.nativeElement.focus();
      }
    }, 0);
  }

  private obtenerMetodoPagoId(nombre: string): number {
    const metodo = this.metodosDisponibles.find((m) => m.nombre === nombre);
    return metodo && metodo.id !== undefined && metodo.id !== null
      ? metodo.id
      : 0;
  }

  private imprimirBoleta(): void {
    const contenidoBoleta = this.generarContenidoBoleta(); // Genera el contenido formateado
    const nombreImpresora = 'ImpresoraTermica'; // Reemplaza con el nombre real de la impresora

    this.impresoraService
      .imprimirBoleta(nombreImpresora, contenidoBoleta)
      .then(() => {
        this.modalInstance.hide(); // Cerrar el modal después de imprimir
        this.resetFormulario(); // Limpiar el formulario de venta
        this.mostrarSuccessToast(); // Mostrar un mensaje de éxito si deseas
      })
      .catch((error) => {
        console.error('Error al imprimir la boleta:', error);
        alert('Hubo un error al intentar imprimir la boleta.');
      });
  }

  private generarContenidoBoleta(): string {
    const encabezado = `R.U.T.: 77.163.978-K\nBOLETA ELECTRONICA\n\nINVERSIONES C&C SPA\nVENTA AL POR MENOR DE PRODUCTOS FARMACEUTICOS\nAV SIMON BOLIVAR 4109 MAIPU\n\n`;
    const fechaObjeto = new Date();
    const fechaFormateada = fechaObjeto.toLocaleDateString('es-CL');
    const horaFormateada = fechaObjeto.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const fecha = `Emision: ${fechaFormateada} ${horaFormateada}\n\n`;
    const idVenta = `Ticket: ${this.ventaId}\n\n`; // Agregar el ID de la venta
    const items = this.carrito
      .map(
        (item) =>
          `${item.producto.nombre}\t${
            item.cantidad
          } x ${item.precioUnitario.toFixed(2)}\t${item.subtotal.toFixed(2)}`
      )
      .join('\n');
    const total = `\nNeto: ${(this.calcularTotal() * 0.81).toFixed(2)}\nIVA: ${(
      this.calcularTotal() * 0.19
    ).toFixed(2)}\nTotal: ${this.calcularTotal().toFixed(2)}\n`;

    return `${encabezado}${fecha}${idVenta}${items}${total}`;
  }
}
