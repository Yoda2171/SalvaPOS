import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NavbarInventarioComponent } from '../../components/navbarInventario/navbarInventario.component';
import { Producto } from '../../Interface/producto.interface';
import { ProductoService } from '../../../services/producto.service';
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
  @ViewChild('searchInput') searchInput!: ElementRef;

  productos: Producto[] = [];
  searchTerm: string = ''; // Término de búsqueda
  currentPage: number = 1;
  limit: number = 12; // Límite por página
  totalItems: number = 0;
  totalPages: number = 0;

  // Formulario de ajuste de stock
  stockForm!: FormGroup;
  selectedProduct: Producto | null = null; // Producto seleccionado para ajuste de stock
  mensajeExito: string | null = null; // Mensaje de éxito para el toast

  private modalInstance: any; // Instancia del modal
  private toastInstance: any; // Instancia del toast

  constructor(
    private readonly productService: ProductoService,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProductos(this.searchTerm, this.currentPage);

    // Inicializar el formulario de ajuste de stock
    this.stockForm = this.fb.group({
      cantidadAjuste: [0, [Validators.required]],
    });

    // Check if window is defined before using it
    if (typeof window !== 'undefined') {
      // Inicializar el modal y toast de Bootstrap
      this.modalInstance = new window.bootstrap.Modal(
        document.getElementById('stockModal')
      );
      this.toastInstance = new window.bootstrap.Toast(
        document.getElementById('successToast')
      );

      // Usar history.state para obtener el estado de la navegación
      const navigationState = window.history.state;
      console.log('Estado de la navegación:', navigationState); // Depuración
      if (navigationState?.mensajeExito) {
        this.mensajeExito = navigationState.mensajeExito;
        this.showToast(); // Mostrar el toast si hay un mensaje de éxito
      }
    }

    // Activar el input de búsqueda al ingresar al componente
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 0);
  }

  cargarProductos(search: string, page: number): void {
    this.productService.getProductos(search, page, this.limit).subscribe({
      next: (response) => {
        this.productos = response.data;
        this.totalItems = response.totalItems;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar los productos:', error);
      },
    });
  }

  showToast(): void {
    if (this.mensajeExito) {
      console.log('Mostrando toast con el mensaje:', this.mensajeExito); // Depuración
      this.toastInstance.show(); // Mostrar el toast si hay un mensaje de éxito
    }
  }

  // Método para abrir el modal de ajuste de stock
  openStockModal(product: Producto): void {
    this.selectedProduct = product;
    this.stockForm.reset();
    this.modalInstance.show();
  }

  // Método para enviar el ajuste de stock
  ajustarStock(): void {
    if (
      this.stockForm.invalid ||
      !this.selectedProduct ||
      this.selectedProduct.id === undefined
    ) {
      return;
    }

    const cantidadAjuste = this.stockForm.value.cantidadAjuste;
    const nuevoStock = this.selectedProduct.cantidad + cantidadAjuste;

    // Validar que el stock no sea negativo después del ajuste
    if (nuevoStock < 0) {
      alert('El stock no puede quedar negativo.'); // Mostrar alerta simple si el stock es negativo
      return;
    }

    this.productService
      .ajustarStock(this.selectedProduct.id, cantidadAjuste)
      .subscribe({
        next: () => {
          this.mensajeExito = `El stock de "${
            this.selectedProduct?.nombre ?? 'Producto'
          }" ha sido ajustado con éxito.`;
          this.modalInstance?.hide(); // Cerrar el modal después del ajuste
          this.toastInstance?.show(); // Mostrar el toast de éxito
          this.cargarProductos(this.searchTerm, this.currentPage); // Recargar productos
        },
        error: (error) => {
          console.error('Error al ajustar el stock:', error);
        },
      });
  }

  onSearch(): void {
    this.currentPage = 1; // Reinicia la paginación al hacer una búsqueda
    this.cargarProductos(this.searchTerm, this.currentPage);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.cargarProductos(this.searchTerm, page);
  }
}
