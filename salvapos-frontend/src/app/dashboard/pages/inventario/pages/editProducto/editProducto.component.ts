import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
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
  currentImageUrl: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly categoriaService: CategoriaService,
    private readonly productoService: ProductoService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      codigoBarras: ['', Validators.required],
      categoriaId: [null, [Validators.required, Validators.min(1)]],
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

    this.productoId = +this.route.snapshot.paramMap.get('id')!;
    this.categorias$ = this.categoriaService.getCategoriasAll();
    this.cargarProducto();

    this.productoForm.valueChanges.subscribe(() => {
      this.validateForm();
    });
  }

  cargarProducto(): void {
    this.loading$ = new Observable<boolean>((observer) => {
      observer.next(true);
      this.productoService.getProductoById(this.productoId).subscribe({
        next: (producto) => {
          console.log(producto.imagen);
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
            this.currentImageUrl = producto.imagen || null;
          }
          observer.next(false);
        },
        error: () => observer.next(false),
      });
    });
  }

  onSubmit(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    const formValue = this.productoForm.value;
    const updatedProducto = {
      ...formValue,
      precioCosto: parseFloat(formValue.precioCosto.replace(/\./g, '')),
      precioVenta: parseFloat(formValue.precioVenta.replace(/\./g, '')),
      categoriaId: +formValue.categoriaId,
    };

    const fileInput = document.getElementById('imagen') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        updatedProducto.imagen = base64String;

        this.productoService
          .updateProducto(this.productoId, updatedProducto)
          .subscribe({
            next: () => {
              this.router.navigate(['/dashboard/inventario'], {
                state: { mensajeExito: 'Producto editado correctamente' },
              });
            },
            error: (error) => {
              console.error('Error al editar el producto', error);

              // Manejo de errores de nombre y código de barras ya existentes
              if (
                error.error.message === 'Ya existe un producto con ese nombre'
              ) {
                this.productoForm
                  .get('nombre')
                  ?.setErrors({ nombreExists: true });
                this.productoForm.get('nombre')?.markAsTouched();
              }
              if (
                error.error.message ===
                'Ya existe un producto con ese código de barras'
              ) {
                this.productoForm
                  .get('codigoBarras')
                  ?.setErrors({ codigoBarrasExists: true });
                this.productoForm.get('codigoBarras')?.markAsTouched();
              }
            },
          });
      };
      reader.readAsDataURL(file);
    } else {
      this.productoService
        .updateProducto(this.productoId, updatedProducto)
        .subscribe({
          next: () => {
            this.router.navigate(['/dashboard/inventario'], {
              state: { mensajeExito: 'Producto editado correctamente' },
            });
          },
          error: (error) => {
            console.error('Error al editar el producto', error);

            // Manejo de errores de nombre y código de barras ya existentes
            if (
              error.error.message === 'Ya existe un producto con ese nombre'
            ) {
              this.productoForm
                .get('nombre')
                ?.setErrors({ nombreExists: true });
              this.productoForm.get('nombre')?.markAsTouched();
            }
            if (
              error.error.message ===
              'Ya existe un producto con ese código de barras'
            ) {
              this.productoForm
                .get('codigoBarras')
                ?.setErrors({ codigoBarrasExists: true });
              this.productoForm.get('codigoBarras')?.markAsTouched();
            }
          },
        });
    }
  }

  // Función para formatear el monto como moneda
  formatCurrency(value: number | string | null): string {
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
      const formattedValue = this.formatCurrency(numericValue);
      this.productoForm.patchValue({ [controlName]: numericValue });
      input.value = formattedValue;
    }
  }

  // Función para validar el formulario
  validateForm(): void {
    Object.keys(this.productoForm.controls).forEach((key) => {
      const control = this.productoForm.get(key);
      if (control && control.invalid && control.touched) {
        control.markAsTouched();
      }
    });
  }
}
