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
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MetodoPago } from '../../Interface/metodoPago.interface';
import { Pago, DetalleVenta, Producto } from '../../Interface/venta.interface';

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
})
export default class VentaComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('stockToast', { static: true }) stockToast!: ElementRef;
  @ViewChild('detalleVentaModal', { static: true })
  detalleVentaModal!: ElementRef;

  carrito: DetalleVenta[] = [];
  montoMaximo: number = 100000;
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
  private toastInstance: any;
  private modalInstance: any; // Instancia del modal
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly productoService: ProductoService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    this.loading$ = this.productoService.loading$;
  }

  ngOnInit(): void {
    this.focusSearchInput();
    this.agregarMetodoPago(); // Agregar un método de pago al iniciar
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('bootstrap').then((bootstrap) => {
        if (this.stockToast && this.stockToast.nativeElement) {
          try {
            this.toastInstance = new bootstrap.Toast(
              this.stockToast.nativeElement
            );
          } catch (error) {
            console.error('Error al inicializar el toast:', error);
          }
        }

        if (this.detalleVentaModal && this.detalleVentaModal.nativeElement) {
          try {
            this.modalInstance = new bootstrap.Modal(
              this.detalleVentaModal.nativeElement
            );
          } catch (error) {
            console.error('Error al inicializar el modal:', error);
          }
        }
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const isInputElement =
      targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA';

    if (!isInputElement && this.searchInput && this.searchInput.nativeElement) {
      this.focusSearchInput();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: any): void {
    this.devolverStock();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.devolverStock();
  }

  mostrarToast() {
    if (this.toastInstance) {
      this.toastInstance.show();
    }
  }

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

  buscarProductos() {
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

  agregarAlCarrito(producto: Producto): void {
    const itemExistente = this.carrito.find(
      (item) => item.producto.id === producto.id
    );

    if (itemExistente) {
      if (producto.cantidad > 0) {
        itemExistente.cantidad++;
        itemExistente.producto.cantidad--; // Reducir el stock disponible
        itemExistente.subtotal =
          itemExistente.cantidad * itemExistente.precioUnitario;

        // Actualizar el stock en el backend
        this.productoService
          .ajustarStock(producto.id, -1)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      } else {
        this.mostrarToast(); // Mostrar toast si el stock es cero
      }
    } else {
      if (producto.cantidad <= 0) {
        this.mostrarToast(); // Mostrar toast si el producto está fuera de stock
        return;
      }

      const nuevoItem: DetalleVenta = {
        producto,
        cantidad: 1,
        precioUnitario: producto.precioVenta,
        subtotal: producto.precioVenta,
      };
      producto.cantidad--; // Reducir el stock disponible
      this.carrito.push(nuevoItem);

      // Ajustar el stock en el backend
      this.productoService
        .ajustarStock(producto.id, -1)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }

    this.productosEncontrados = [];
    this.searchTerm = '';
    this.focusSearchInput();
  }

  aumentarCantidad(item: DetalleVenta) {
    if (item.producto.cantidad > 0) {
      item.cantidad++;
      item.producto.cantidad--; // Reducir el stock disponible
      item.subtotal = item.cantidad * item.precioUnitario;

      // Actualizar el stock en el backend
      this.productoService
        .ajustarStock(item.producto.id, -1)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
    if (item.producto.cantidad <= 0) {
      this.mostrarToast(); // Mostrar toast si el producto está fuera de stock
      return;
    }
    this.focusSearchInput();
  }

  disminuirCantidad(item: DetalleVenta) {
    if (item.cantidad > 1) {
      item.cantidad--;
      item.producto.cantidad++; // Aumentar el stock disponible
      item.subtotal = item.cantidad * item.precioUnitario;

      // Actualizar el stock en el backend
      this.productoService
        .ajustarStock(item.producto.id, 1)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
    this.focusSearchInput();
  }

  eliminarItem(item: DetalleVenta) {
    // Ajustar stock al eliminar item
    this.productoService
      .ajustarStock(item.producto.id, item.cantidad)
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    // Aumentar el stock disponible en el objeto
    item.producto.cantidad += item.cantidad;

    this.carrito = this.carrito.filter((i) => i !== item);
    this.focusSearchInput();
  }

  calcularTotal() {
    return this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  realizarCompra() {
    const total = this.calcularTotal();
    const totalPagado = this.pago.reduce(
      (acc, pago) => acc + (pago.monto ?? 0),
      0
    );

    if (
      this.pago.length === 0 ||
      this.pago.some((pago) => (pago.monto ?? 0) <= 0)
    ) {
      alert(
        'Debe seleccionar un método de pago y asegurarse de que el monto sea mayor a 0.'
      );
      return;
    }

    if (totalPagado < total) {
      alert(
        `El total a pagar es $${total}, pero solo se han ingresado $${totalPagado}.`
      );
      return;
    }

    this.mostrarModalDetalleVenta();
  }

  mostrarModalDetalleVenta() {
    const venta = {
      total: this.calcularTotal().toFixed(2),
      detalles: this.carrito.map((item) => ({
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
        producto: item.producto,
      })),
      pagos: this.pago
        .filter((pago) => (pago.monto ?? 0) > 0)
        .map((pago) => ({
          monto: pago.monto?.toFixed(2) ?? '0.00',
          metodoPago: {
            id: this.obtenerMetodoPagoId(pago.metodoPago.nombre),
            nombre: pago.metodoPago.nombre,
          },
        })),
    };

    console.log(venta);

    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }

  imprimirBoleta() {
    window.print();
  }

  agregarMetodoPago() {
    this.pago.push({
      monto: null,
      metodoPago: { nombre: '' },
    });
  }

  eliminarMetodoPago(index: number) {
    this.pago.splice(index, 1);
  }

  resetFormulario() {
    this.pago = [];
    this.carrito = [];
    this.searchTerm = '';
    this.focusSearchInput();
  }

  private focusSearchInput() {
    setTimeout(() => {
      if (this.searchInput && this.searchInput.nativeElement) {
        this.searchInput.nativeElement.focus();
      }
    }, 0);
  }

  obtenerFechaActual() {
    const fecha = new Date();
    return fecha.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private obtenerMetodoPagoId(nombre: string): number {
    const metodo = this.metodosDisponibles.find((m) => m.nombre === nombre);
    return metodo ? metodo.id! : 0;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
