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
  loading$ = new Observable<boolean>();
  productoId!: number;

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
        [Validators.required, Validators.min(1), Validators.max(10000000)],
      ],
      precioVenta: [
        null,
        [Validators.required, Validators.min(1), Validators.max(10000000)],
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
            this.productoForm.patchValue({
              nombre: producto.nombre,
              codigoBarras: producto.codigoBarras,
              categoriaId: producto.categoria.id,
              cantidad: producto.cantidad,
              precioCosto: producto.precioCosto,
              precioVenta: producto.precioVenta,
            });
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
}
