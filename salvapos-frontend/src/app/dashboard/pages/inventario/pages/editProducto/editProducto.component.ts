import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../../components/navbar/navbar.component';
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CategoriaService } from '../../../../../services/categoria.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Categoria } from '../../../../Interface/categoria.inteface';
import { ProductoService } from '../../../../../services/producto.service';
import { Producto } from '../../../../Interface/producto.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-edit-producto',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './editProducto.component.html',
  styleUrls: ['./editProducto.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditProductoComponent implements OnInit {
  productoForm!: FormGroup;
  categorias$: Observable<Categoria[]> | null = null;
  loading$: Observable<boolean> | null = null;
  productoId!: number; // ID del producto a editar

  constructor(
    private readonly fb: FormBuilder,
    private readonly categoriaService: CategoriaService,
    private readonly productoService: ProductoService,
    private readonly router: Router,
    private readonly route: ActivatedRoute // Para obtener el ID del producto
  ) {}

  ngOnInit(): void {
    // Initialize the form with default values
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      codigoBarras: ['', Validators.required],
      categoriaId: [0, [Validators.required, Validators.min(1)]], // Initialize with 0 and treat as a number
      cantidad: [0, [Validators.required, Validators.min(1)]],
      precioCosto: [0, [Validators.required, Validators.min(0.01)]],
      precioVenta: [0, [Validators.required, Validators.min(0.01)]],
    });

    // Obtener el ID del producto de la ruta
    this.productoId = +this.route.snapshot.paramMap.get('id')!;

    // Load categories and product data
    this.loading$ = this.categoriaService.loading$;
    this.categorias$ = this.categoriaService.getCategoriasAll();

    // Listen for changes and convert the value of categoriaId to a number
    this.productoForm.get('categoriaId')?.valueChanges.subscribe((value) => {
      this.productoForm.patchValue(
        { categoriaId: Number(value) },
        { emitEvent: false }
      );
    });

    // Suscribirse a las categorías para manejar el estado de carga
    this.categorias$.subscribe({
      next: () => {
        // No es necesario manejar el estado de carga aquí, ya que se maneja en el servicio
      },
      error: (error) => {
        console.error('Error al cargar las categorías', error);
      },
    });

    this.cargarProducto();
  }

  cargarProducto(): void {
    this.productoService.getProductoById(this.productoId).subscribe({
      next: (producto) => {
        if (producto) {
          // Actualizar los valores del formulario cuando se carguen los datos del producto
          this.productoForm.patchValue({
            nombre: producto.nombre,
            codigoBarras: producto.codigoBarras,
            categoriaId: producto.categoria.id,
            cantidad: producto.cantidad,
            precioCosto: producto.precioCosto,
            precioVenta: producto.precioVenta,
            // Agregar descripción si existe
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar los datos del producto', error);
      },
    });
  }

  onSubmit(): void {
    if (this.productoForm.invalid) {
      return;
    }

    this.productoService
      .updateProducto(this.productoId, this.productoForm.value)
      .subscribe({
        next: () => {
          // Redirigir al inventario con un mensaje de éxito
          this.router.navigate(['/dashboard/inventario'], {
            state: { mensajeExito: 'Producto editado correctamente' },
          });
        },
        error: (error) => {
          console.error('Error al editar el producto', error);
        },
      });
  }
}
