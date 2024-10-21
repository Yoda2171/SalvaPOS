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
  categorias: Categoria[] = []; // Lista de categorías
  productoId!: number; // ID del producto a editar

  constructor(
    private readonly fb: FormBuilder,
    private readonly categoriaService: CategoriaService,
    private readonly productoService: ProductoService,
    private readonly router: Router,
    private readonly route: ActivatedRoute // Para obtener el ID del producto
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    // Inicializar el formulario vacío

    // Obtener el ID del producto de la ruta
    this.productoId = +this.route.snapshot.paramMap.get('id')!;

    // Cargar las categorías y el producto

    this.cargarProducto();
  }

  cargarCategorias(): void {
    this.categoriaService.getCategoriasAll().subscribe((data) => {
      this.categorias = data;

      this.productoForm = this.fb.group({
        nombre: ['', Validators.required],
        codigoBarras: ['', Validators.required],
        categoriaId: [0, [Validators.required, Validators.min(1)]], // Aquí inicializamos con 0 y lo tratamos como un número
        cantidad: [0, [Validators.required, Validators.min(1)]],
        precioCosto: [0, [Validators.required, Validators.min(0.01)]],
        precioVenta: [0, [Validators.required, Validators.min(0.01)]],
      });
    });
  }

  cargarProducto(): void {
    this.productoService.getProductoById(this.productoId).subscribe({
      next: (producto: Producto) => {
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
        console.error('Error al cargar el producto', error);
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
