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
import { Router, RouterModule } from '@angular/router';
import { Categoria } from '../../../../Interface/categoria.inteface';
import { ProductoService } from '../../../../../services/producto.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-producto',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './addProducto.component.html',
  styleUrls: ['./addProducto.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AddProductoComponent implements OnInit {
  productoForm!: FormGroup;
  categorias$: Observable<Categoria[]> | null = null;
  loading$: Observable<boolean> | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly categoriaService: CategoriaService,
    private readonly productoService: ProductoService,
    private readonly router: Router
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
      descripcion: ['', Validators.required],
    });

    // Load categories
    this.loading$ = this.categoriaService.loading$;
    this.categorias$ = this.categoriaService.getCategoriasAll();

    // Listen for changes and convert the value of categoriaId to a number
    this.productoForm.get('categoriaId')?.valueChanges.subscribe((value) => {
      this.productoForm.patchValue(
        { categoriaId: Number(value) },
        { emitEvent: false }
      );
    });
  }

  onSubmit(): void {
    if (this.productoForm.invalid) {
      return;
    }

    this.productoService.createProducto(this.productoForm.value).subscribe({
      next: () => {
        // Redirect to inventory and pass a state with the success message
        console.log('Redirecting to inventory with success message'); // Debugging
        this.router.navigate(['/dashboard/inventario'], {
          state: { mensajeExito: 'Producto agregado correctamente' },
        });
      },
      error: (error) => {
        console.error('Error al agregar el producto', error);
      },
    });
  }
}
