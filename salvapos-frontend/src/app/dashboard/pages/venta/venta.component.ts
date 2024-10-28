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
} from '../../Interface/venta.interface';
import { VentaService } from '../../../services/venta.service';
import { Router, RouterModule } from '@angular/router';
import ReporteVentaComponent from '../reportes/pages/reporteVenta/reporteVenta.component';
import { NavabarVentaComponent } from '../../components/navabarVenta/navabarVenta.component';

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

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly productoService: ProductoService,
    private readonly ventaService: VentaService,
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
        subtotal: item.subtotal,
        producto: item.producto,
      })),
      pagos: this.pago.map((pago) => ({
        metodoPagoId: this.obtenerMetodoPagoId(pago.metodoPago.nombre),
        monto: pago.monto ?? 0,
      })),
    };

    this.ventaService.createVenta(venta).subscribe({
      next: () => {
        this.mostrarSuccessToast();
        this.modalInstance.hide();
      },
      error: (error) => {
        console.error('Error al realizar la venta:', error);
        alert('Hubo un error al procesar la venta.');
      },
    });

    this.resetFormulario();
    this.focusSearchInput();
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
}
