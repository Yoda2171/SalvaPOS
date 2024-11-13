import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../../components/navbar/navbar.component';
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
} from '@angular/forms';
import { CategoriaService } from '../../../../../services/categoria.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Categoria } from '../../../../Interface/categoria.inteface';
import { ProductoService } from '../../../../../services/producto.service';
import { Producto } from '../../../../Interface/producto.interface';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
  loading$ = new Observable<boolean>();
  productoId!: number;
  currentProducto!: Producto;

  constructor(
    private readonly fb: FormBuilder,
    private readonly categoriaService: CategoriaService,
    private readonly productoService: ProductoService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required, this.nombreValidator()],
      codigoBarras: ['', Validators.required, this.codigoBarrasValidator()],
      categoriaId: [null, [Validators.required, Validators.min(1)]],
      cantidad: [
        null,
        [Validators.required, Validators.min(1), Validators.max(1000)],
      ],
      precioCosto: [
        '',
        [Validators.required, Validators.min(1), Validators.max(100000000)],
      ],
      precioVenta: [
        '',
        [Validators.required, Validators.min(1), Validators.max(100000000)],
      ],
    });

    this.productoId = +this.route.snapshot.paramMap.get('id')!;
    this.categorias$ = this.categoriaService.getCategoriasAll();
    this.cargarProducto();
  }

  cargarProducto(): void {
    this.loading$ = new Observable<boolean>((observer) => {
      observer.next(true);
      this.productoService.getProductoById(this.productoId).subscribe({
        next: (producto) => {
          if (producto) {
            this.currentProducto = producto;
            this.productoForm.patchValue({
              nombre: producto.nombre,
              codigoBarras: producto.codigoBarras,
              categoriaId: producto.categoria.id,
              cantidad: producto.cantidad,
              precioCosto: this.formatCurrency(producto.precioCosto),
              precioVenta: this.formatCurrency(producto.precioVenta),
            });
          }
          observer.next(false);
        },
        error: () => observer.next(false),
      });
    });
  }

  nombreValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (control.value === this.currentProducto?.nombre) {
        return of(null);
      }
      return this.productoService.checkIfProductExists(control.value, '').pipe(
        map((response: any) => {
          console.log(`Product exists: ${response.existe}`); // Debugging line
          return response.existe ? { nombreExists: true } : null;
        }),
        catchError(() => of(null))
      );
    };
  }

  codigoBarrasValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (control.value === this.currentProducto?.codigoBarras) {
        return of(null);
      }
      return this.productoService.checkIfProductExists('', control.value).pipe(
        map((response: any) => {
          console.log(`Product exists: ${response.existe}`); // Debugging line
          return response.existe ? { codigoBarrasExists: true } : null;
        }),
        catchError(() => of(null))
      );
    };
  }

  onSubmit(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    this.productoService
      .updateProducto(this.productoId, this.productoForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard/inventario'], {
            state: { mensajeExito: 'Producto editado correctamente' },
          });
        },
        error: (error) => {
          console.error('Error al editar el producto', error);
        },
      });
  }

  // Función para formatear el monto como moneda
  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Formateo con puntos como separadores de miles
  }

  // Función para manejar el cambio en el monto
  onMontoChange(controlName: string, value: string): void {
    // Elimina los puntos y convierte el valor a un número flotante
    const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
    if (!isNaN(numericValue)) {
      this.productoForm.patchValue({ [controlName]: numericValue });
    }
  }

  // Función para manejar la entrada en el monto
  onMontoInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const numericValue = input.value.replace(/\D/g, ''); // Elimina todos los caracteres no numéricos
    if (numericValue === '') {
      this.productoForm.patchValue({ [controlName]: null });
      input.value = '';
    } else {
      const formattedValue = this.formatCurrency(parseFloat(numericValue));
      this.productoForm.patchValue({ [controlName]: parseFloat(numericValue) });
      input.value = formattedValue;
    }
  }
}
