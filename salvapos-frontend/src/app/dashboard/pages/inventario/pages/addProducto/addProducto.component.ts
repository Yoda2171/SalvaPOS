import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

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
import { Router, RouterModule } from '@angular/router';
import { Categoria } from '../../../../Interface/categoria.inteface';
import { ProductoService } from '../../../../../services/producto.service';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-add-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
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
      nombre: ['', Validators.required, this.nombreValidator()],
      codigoBarras: ['', Validators.required, this.codigoBarrasValidator()],
      categoriaId: [null, [Validators.required, Validators.min(1)]], // Initialize with 0 and treat as a number
      cantidad: [
        null,
        [Validators.required, Validators.min(1), Validators.max(1000)],
      ],
      precioCosto: [
        null,
        [Validators.required, Validators.min(1), Validators.max(100000000)],
      ],
      precioVenta: [
        null,
        [Validators.required, Validators.min(1), Validators.max(100000000)],
      ],
      imagen: [null],
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

    // Suscribirse a las categorías para manejar el estado de carga
    this.categorias$.subscribe({
      next: () => {
        // No es necesario manejar el estado de carga aquí, ya que se maneja en el servicio
      },
      error: (error) => {
        console.error('Error al cargar las categorías', error);
      },
    });
  }

  nombreValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
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
      return;
    }

    const formData = this.productoForm.value;

    const fileInput = document.getElementById('imagen') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        formData.imagen = base64String;

        this.productoService.createProducto(formData).subscribe({
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
      };
      reader.readAsDataURL(file);
    } else {
      this.productoService.createProducto(formData).subscribe({
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
