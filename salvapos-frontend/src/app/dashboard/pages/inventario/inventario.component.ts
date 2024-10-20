import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { NavbarInventarioComponent } from '../../components/navbarInventario/navbarInventario.component';
import { Producto } from '../../Interface/producto.interface';
import { Categoria } from '../../Interface/categoria.inteface';
declare let window: any;

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NavbarInventarioComponent,
    FormsModule,
  ],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventarioComponent implements OnInit {
  productos: any[] = [];
  filteredProductos: any[] = [];
  totalItems: number = 0;
  totalPages: number = 0;
  currentPage: number = 1;
  limit: number = 8;
  pages: number[] = [];
  searchTerm: string = ''; // Término de búsqueda

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Aquí puedes hacer una petición HTTP para obtener los datos de la API.
    const response = {
      totalItems: 14,
      totalPages: 2,
      currentPage: 1,
      limit: 8,
      data: {
        productos: [
          {
            id: 1,
            codigoBarras: 'E14CtbwC',
            nombre: 'Refined Frozen Cheese',
            precioCosto: 322,
            precioVenta: 195,
            cantidad: 31,
            categoria: { id: 9, nombre: 'Shoes' },
          },
          {
            id: 9,
            codigoBarras: 'YaCFrFSC',
            nombre: 'Electronic Bronze Computer',
            precioCosto: 592,
            precioVenta: 523,
            cantidad: 11,
            categoria: { id: 9, nombre: 'Shoes' },
          },
          {
            id: 15,
            codigoBarras: 't2wVYiTE',
            nombre: 'Tasty Cotton Chair',
            precioCosto: 799,
            precioVenta: 153,
            cantidad: 62,
            categoria: { id: 9, nombre: 'Shoes' },
          },
          {
            id: 19,
            codigoBarras: 'UPCedwa6',
            nombre: 'Bespoke Granite Fish',
            precioCosto: 31,
            precioVenta: 749,
            cantidad: 27,
            categoria: { id: 9, nombre: 'Shoes' },
          },
          {
            id: 20,
            codigoBarras: 'niqFD2fO',
            nombre: 'Handmade Fresh Towels',
            precioCosto: 515,
            precioVenta: 573,
            cantidad: 93,
            categoria: { id: 9, nombre: 'Shoes' },
          },
          {
            id: 21,
            codigoBarras: 'GDidAnDa',
            nombre: 'Handmade Fresh Shoes',
            precioCosto: 594,
            precioVenta: 542,
            cantidad: 1,
            categoria: { id: 3, nombre: 'Health' },
          },
          {
            id: 22,
            codigoBarras: 'ZUFwLGDb',
            nombre: 'Generic Steel Bike',
            precioCosto: 837,
            precioVenta: 999,
            cantidad: 61,
            categoria: { id: 9, nombre: 'Shoes' },
          },
          {
            id: 26,
            codigoBarras: 'AFIWQfJn',
            nombre: 'Fantastic Soft Shoes',
            precioCosto: 395,
            precioVenta: 611,
            cantidad: 31,
            categoria: { id: 11, nombre: 'Toys' },
          },
        ],
      },
    };

    this.productos = response.data.productos;
    this.filteredProductos = this.productos; // Inicializar la lista filtrada
    this.totalItems = response.totalItems;
    this.totalPages = response.totalPages;
    this.currentPage = response.currentPage;
    this.limit = response.limit;
    this.setPages();
  }

  // Método de búsqueda
  onSearch(): void {
    if (this.searchTerm) {
      this.filteredProductos = this.productos.filter(
        (producto) =>
          producto.nombre
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          producto.codigoBarras
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredProductos = this.productos; // Si no hay búsqueda, mostrar todos los productos
    }
  }

  // Métodos para la paginación
  setPages(): void {
    this.pages = Array(this.totalPages)
      .fill(0)
      .map((x, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      // Aquí haces la llamada para obtener la página correspondiente
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      // Aquí haces la llamada para obtener la página correspondiente
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      // Aquí haces la llamada para obtener la página correspondiente
    }
  }
}
