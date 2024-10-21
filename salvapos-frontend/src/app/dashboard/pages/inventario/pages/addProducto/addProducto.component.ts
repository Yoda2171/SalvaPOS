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
  styleUrl: './addProducto.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AddProductoComponent implements OnInit {
  productoForm!: FormGroup;
  categorias: Categoria[] = []; // Lista de categorías que se llenará desde un servicio

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cargar las categorías antes de inicializar el formulario
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.getCategoriasAll().subscribe((data) => {
      this.categorias = data; // Aquí llenamos el dropdown de categorías

      // Inicializar el formulario una vez que las categorías han sido cargadas
      this.productoForm = this.fb.group({
        nombre: ['', Validators.required],
        codigoBarras: ['', Validators.required],
        categoriaId: [0, [Validators.required, Validators.min(1)]], // Aquí inicializamos con 0 y lo tratamos como un número
        cantidad: [0, [Validators.required, Validators.min(1)]],
        precioCosto: [0, [Validators.required, Validators.min(0.01)]],
        precioVenta: [0, [Validators.required, Validators.min(0.01)]],
      });

      // Escuchar cambios y convertir el valor de categoriaId a número
      this.productoForm.get('categoriaId')?.valueChanges.subscribe((value) => {
        this.productoForm.patchValue(
          { categoriaId: Number(value) },
          { emitEvent: false }
        );
      });
    });
  }

  onSubmit(): void {
    if (this.productoForm.invalid) {
      return;
    }

    this.productoService.createProducto(this.productoForm.value).subscribe({
      next: () => {
        // Redirigir al inventario y pasar un estado con el mensaje de éxito
        console.log('Redirigiendo al inventario con mensaje de éxito'); // Depuración
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
