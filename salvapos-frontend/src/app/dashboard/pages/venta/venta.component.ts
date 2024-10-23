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
import * as bootstrap from 'bootstrap'; // Import Bootstrap

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
})
export default class VentaComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef; // Referencia al input de búsqueda
  @ViewChild('stockToast', { static: true }) stockToast!: ElementRef; // Referencia al Toast
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
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 0);

    // Inicializar el toast de Bootstrap
    if (typeof window !== 'undefined') {
      this.toastInstance = new bootstrap.Toast(this.stockToast.nativeElement);
    }
  }

  // Escuchar eventos de recarga o cierre de ventana
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: any): void {
    this.devolverStock(); // Devolver el stock antes de salir de la página
  }

  // Método llamado cuando el componente se destruye
  ngOnDestroy(): void {
    // Emitir un valor para destruir las suscripciones
    this.destroy$.next();
    this.destroy$.complete();

    // Devolver todo el stock del carrito al inventario
    this.devolverStock();
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
        },
        error: (error) => {
          console.error('Error al buscar productos:', error);
        },
      });
  }

  // Método para agregar un producto al carrito
  agregarAlCarrito(producto: Producto): void {
    const itemExistente = this.carrito.find((item) => item.id === producto.id);

    if (itemExistente) {
      // Si el producto ya está en el carrito, aumentar la cantidad
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
        this.mostrarToast();
      }
    } else {
      // Si el producto no está en el carrito, agregarlo con cantidad 1
      if (producto.id === undefined) {
        console.error('El producto no tiene un ID definido');
        return;
      }

      this.carrito.push({
        nombre: producto.nombre,
        precio: producto.precioVenta,
        cantidad: 1, // Agregar con cantidad inicial de 1
        id: producto.id, // ID del producto
        stockDisponible: producto.cantidad - 1, // Stock inicial del producto
      });
      this.productoService
        .ajustarStock(producto.id, -1)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }

    // Limpiar el término de búsqueda y los resultados
    this.productosEncontrados = [];
    this.searchTerm = '';

    // Restablecer el foco en el input después de que Angular actualice la vista
    setTimeout(() => {
      this.searchInput.nativeElement.focus(); // Reenfocar el input
    }, 0);
  }

  // Método para aumentar la cantidad de un producto en el carrito
  aumentarCantidad(item: any) {
    if (item.stockDisponible > 0) {
      item.cantidad++;
      item.stockDisponible--; // Reducir stock disponible
      this.productoService
        .ajustarStock(item.id, -1)
        .pipe(takeUntil(this.destroy$))
        .subscribe(); // Reducir stock en el inventario
    } else {
      this.mostrarToast(); // Mostrar el toast si no hay más stock disponible
    }
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
  }

  // Método para eliminar un producto del carrito
  eliminarItem(item: any) {
    this.productoService
      .ajustarStock(item.id, item.cantidad)
      .pipe(takeUntil(this.destroy$))
      .subscribe(); // Devolver el stock completo al inventario
    this.carrito = this.carrito.filter((i) => i !== item);
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
  }

  // Mostrar un toast notificando que el stock está agotado
  mostrarToast() {
    this.toastInstance.show();
  }
}
