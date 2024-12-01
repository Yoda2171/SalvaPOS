  import { Component, inject, OnInit } from '@angular/core';
  import { ProductoService } from '../../services/producto.service';
  import { CartService } from '../../services/cart.service';
  import { Producto, Pagination } from '../../interfaces/producto';

  @Component({
    selector: 'app-home',
    standalone: true,
    imports: [],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
  })
  export class HomeComponent implements OnInit {
    productos: Producto[] = []; // Lista de productos obtenidos
    loading: boolean = false; // Indicador de carga
    cart = inject(CartService); // Servicio del carrito

    constructor(private productoService: ProductoService) {}

    ngOnInit(): void {
      this.getProductos(); // Cargar productos al iniciar
    }

    getProductos(): void {
      this.loading = true; // Activar indicador de carga
      this.productoService.getProductos().subscribe({
        next: (response: Pagination) => {
          this.productos = response.data; // Extraer los productos de la propiedad `data`
          this.loading = false; // Desactivar indicador de carga
        },
        error: (err) => {
          console.error('Error al obtener productos:', err);
          this.loading = false; // Desactivar indicador de carga en caso de error
        },
      });
    }

    agregarAlCarrito(producto: Producto): void {
      const stockDisponible = producto.cantidad;
      if (stockDisponible > 0) {
        this.cart.agregar(producto);
        producto.cantidad -= 1; // Reducir el stock del producto
      } else {
        alert('Producto sin stock disponible');
      }
    }
  }
