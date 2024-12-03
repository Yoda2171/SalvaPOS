import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ProductoService } from '../../../services/producto.service';
import { Observable } from 'rxjs';
import { Pagination, Producto } from '../../Interface/producto.interface';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent implements OnInit {
  productos: Producto[] = [];
  loading$: Observable<boolean>;
  search: string = '';
  page: number = 1;
  limit: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  userRole: string | null = null;
  private readonly productoService = inject(ProductoService);
  private readonly cartService = inject(CartService);

  constructor(private readonly authService: AuthService) {
    this.loading$ = this.productoService.loading$;
  }

  ngOnInit(): void {
    this.getProductos();
    const currentUser = this.authService.getCurrentUser();
    this.userRole = currentUser ? currentUser.role : null;
  }

  getProductos(): void {
    this.productoService
      .getProductos(this.search, this.page, this.limit)
      .subscribe((response) => {
        this.productos = response.data;
        this.totalItems = response.totalItems;
        this.totalPages = response.totalPages;
      });
  }

  onSearch(): void {
    this.page = 1; // Reset to first page on new search
    this.getProductos();
  }

  onPageChange(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) {
      return;
    }
    this.page = newPage;
    this.getProductos();
  }

  agregar(producto: Producto): void {
    this.cartService.agregar(producto);
    console.log('Producto agregado:', producto);
  }

  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Formateo con puntos como separadores de miles
  }
}
