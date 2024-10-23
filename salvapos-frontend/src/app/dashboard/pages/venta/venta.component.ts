import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../Interface/producto.interface';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as bootstrap from 'bootstrap'; // Para manejar Bootstrap modals y toasts

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
})
export default class VentaComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef; // Referencia al input de búsqueda
  @ViewChild('stockToast', { static: true }) stockToast!: ElementRef;
  carrito = [
    {
      nombre: 'Jarabe-Abrilar',
      precio: 2085,
      cantidad: 1,
      id: 1, // ID del producto para identificarlo en el backend
      stockDisponible: 5, // Stock inicial
    },
    {
      nombre: 'Paracetamol',
      precio: 2085,
      cantidad: 1,
      id: 2, // ID del producto para identificarlo en el backend
      stockDisponible: 3, // Stock inicial
    },
  ];

  metodoPago: string = ''; // Puede ser 'tarjeta' o 'efectivo'
  tipoTarjeta: string = ''; // Puede ser 'credito' o 'debito'
  montoTarjeta: number = 0;
  montoEfectivo: number = 0; // Monto ingresado al pagar en efectivo
  montoMaximo: number = 100000; // Límite máximo de 100,000 pesos (CLP)
  searchTerm: string = ''; // Término de búsqueda
  productosEncontrados: Producto[] = []; // Productos encontrados en la búsqueda
  loading$: Observable<boolean>; // Observable para el estado de carga

  private toastInstance: any; // Instancia del toast
  private destroy$ = new Subject<void>(); // Subject para manejar la destrucción del componente

  constructor(private readonly productoService: ProductoService) {
    this.loading$ = this.productoService.loading$;
  }

  ngOnInit(): void {
    // Enfocar el input cuando el componente carga
    this.focusSearchInput();
    this.mostrarToast();

    // Inicializar el toast de Bootstrap
  }

  ngAfterViewInit(): void {
    if (
      typeof document !== 'undefined' &&
      this.stockToast &&
      this.stockToast.nativeElement
    ) {
      try {
        this.toastInstance = new bootstrap.Toast(this.stockToast.nativeElement);
        console.log('Toast inicializado correctamente.');
      } catch (error) {
        console.error('Error al inicializar el toast:', error);
      }
    } else {
      console.error(
        'Elemento del Toast no disponible o el entorno no es un navegador.'
      );
    }
  }

  // Escuchar eventos de recarga o cierre de ventana
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: any): void {
    this.devolverStock(); // Devolver el stock antes de salir de la página
  }

  // Escuchar clics en el documento para mantener el input de búsqueda enfocado
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.searchInput &&
      this.searchInput.nativeElement &&
      event.target !== this.searchInput.nativeElement
    ) {
      this.focusSearchInput(); // Reenfocar el input si se hace clic afuera
    }
  }

  // Método llamado cuando el componente se destruye
  ngOnDestroy(): void {
    // Emitir un valor para destruir las suscripciones
    this.destroy$.next();
    this.destroy$.complete();

    // Devolver todo el stock del carrito al inventario
    this.devolverStock();
  }

  // Método para mostrar el toast de Bootstrap
  mostrarToast() {
    if (this.toastInstance) {
      this.toastInstance.show();
    } else {
      console.error('Toast no inicializado');
    }
  }
  // Método para devolver el stock al inventario
  devolverStock(): void {
    this.carrito.forEach((item) => {
      if (item.cantidad > 0) {
        this.productoService
          .ajustarStock(item.id, item.cantidad)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            error: (err) => console.error('Error al devolver el stock:', err),
          });
      }
    });
  }

  // Método para buscar productos
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

          // Si solo se encuentra un producto, agregarlo automáticamente al carrito
          if (this.productosEncontrados.length === 1) {
            this.agregarAlCarrito(this.productosEncontrados[0]);
          }

          // Mantener el foco en el campo de búsqueda
          this.focusSearchInput();
        },
        error: (error) => {
          console.error('Error al buscar productos:', error);
          this.focusSearchInput(); // Enfocar siempre el input aunque haya error
        },
      });
  }

  // Método para agregar un producto al carrito
  agregarAlCarrito(producto: Producto): void {
    const itemExistente = this.carrito.find((item) => item.id === producto.id);

    if (itemExistente) {
      if (itemExistente.stockDisponible > 0) {
        itemExistente.cantidad++;
        itemExistente.stockDisponible--;

        if (producto.id !== undefined) {
          this.productoService
            .ajustarStock(producto.id, -1)
            .pipe(takeUntil(this.destroy$))
            .subscribe();
        }
      } else {
        this.mostrarToast(); // Mostrar el toast cuando el stock llegue a 0
      }
    } else {
      if (producto.id === undefined) {
        console.error('El producto no tiene un ID definido');
        return;
      }

      const nuevoItem = {
        nombre: producto.nombre,
        precio: producto.precioVenta,
        cantidad: 1,
        id: producto.id,
        stockDisponible: producto.cantidad - 1,
      };
      this.carrito.push(nuevoItem);

      this.productoService
        .ajustarStock(producto.id, -1)
        .pipe(takeUntil(this.destroy$))
        .subscribe();

      if (nuevoItem.stockDisponible === 0) {
        this.mostrarToast(); // Mostrar el toast si el stock inicial ya es 0
      }
    }

    this.productosEncontrados = [];
    this.searchTerm = '';
    this.focusSearchInput();
  }

  // Método para aumentar la cantidad de un producto en el carrito
  aumentarCantidad(item: any) {
    if (item.stockDisponible > 0) {
      item.cantidad++;
      item.stockDisponible--; // Reducir stock disponible
      this.productoService
        .ajustarStock(item.id, -1)
        .pipe(takeUntil(this.destroy$))
        .subscribe();

      console.log(item.stockDisponible);
    }

    if (item.stockDisponible == 0) {
      this.mostrarToast(); // Mostrar el toast si no hay más stock disponible
    }

    this.focusSearchInput();
  }

  // Método para disminuir la cantidad de un producto en el carrito
  disminuirCantidad(item: any) {
    if (item.cantidad > 1) {
      item.cantidad--;
      item.stockDisponible++; // Aumentar stock disponible
      this.productoService
        .ajustarStock(item.id, 1)
        .pipe(takeUntil(this.destroy$))
        .subscribe(); // Aumentar stock en el inventario
    }

    // Mantener el foco en el campo de búsqueda
    this.focusSearchInput();
  }

  // Método para eliminar un producto del carrito
  eliminarItem(item: any) {
    this.productoService
      .ajustarStock(item.id, item.cantidad)
      .pipe(takeUntil(this.destroy$))
      .subscribe(); // Devolver el stock completo al inventario
    this.carrito = this.carrito.filter((i) => i !== item);

    // Mantener el foco en el campo de búsqueda
    this.focusSearchInput();
  }

  // Calcular el total de la compra
  calcularTotal() {
    return this.carrito.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    );
  }

  // Método para reiniciar el formulario después de cada pago
  resetFormulario() {
    this.metodoPago = ''; // Reiniciar el método de pago
    this.tipoTarjeta = ''; // Reiniciar el tipo de tarjeta
    this.montoTarjeta = 0; // Reiniciar el monto de tarjeta
    this.montoEfectivo = 0; // Reiniciar el monto en efectivo

    // Mantener el foco en el campo de búsqueda
    this.focusSearchInput();
  }

  // Método para reenfocar el campo de búsqueda
  private focusSearchInput() {
    setTimeout(() => {
      if (this.searchInput && this.searchInput.nativeElement) {
        this.searchInput.nativeElement.focus();
      }
    }, 0);
  }
}
