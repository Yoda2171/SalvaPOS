import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { Categoria } from '../../Interface/categoria.inteface';
import { NavbarInventarioComponent } from '../../components/navbarInventario/navbarInventario.component';
declare let window: any;

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    NavbarInventarioComponent,
  ],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CategoriaComponent implements OnInit {
  categorias: Categoria[] = []; // Lista de categorías
  filteredCategorias: Categoria[] = []; // Lista filtrada de categorías
  categoriaForm!: FormGroup; // Formulario para agregar/editar categoría
  isEditMode: boolean = false; // Modo edición
  currentCategoriaId: number | null = null; // ID de la categoría actual
  categoriaSeleccionada: Categoria | null = null; // Categoría seleccionada para eliminar
  mensajeError: string | null = null; // Para mostrar error al eliminar
  mensajeExito: string | null = null; // Para mostrar mensaje de éxito
  searchTerm: string = ''; // Término de búsqueda

  // Paginación
  currentPage: number = 1; // Página actual
  limit: number = 5; // Categorías por página
  totalItems: number = 0; // Total de categorías
  totalPages: number = 0; // Total de páginas

  private modalInstance: any; // Modal de Bootstrap
  private toastInstance: any; // Toast de Bootstrap
  private confirmModalInstance: any; // Modal de confirmación de eliminación

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
    });

    // Simulación de categorías
    this.categorias = [
      { id: 1, nombre: 'Kids', productos: [] },
      { id: 2, nombre: 'Home', productos: [{ id: 1 }] },
      { id: 3, nombre: 'Electronics', productos: [] },
      { id: 4, nombre: 'Fashion', productos: [{ id: 2 }, { id: 3 }] },
      { id: 3, nombre: 'Electronics', productos: [] },
      { id: 4, nombre: 'Fashion', productos: [{ id: 2 }, { id: 3 }] },
      { id: 3, nombre: 'Electronics', productos: [] },
      { id: 4, nombre: 'Fashion', productos: [{ id: 2 }, { id: 3 }] },
      { id: 5, nombre: 'Health', productos: [] },
    ];

    this.totalItems = this.categorias.length;
    this.totalPages = Math.ceil(this.totalItems / this.limit);

    // Inicializa `filteredCategorias` con todas las categorías al cargar la página
    this.filteredCategorias = [...this.categorias];
    this.cargarCategorias(this.currentPage);

    // Inicializar el modal y toast de Bootstrap
    this.modalInstance = new window.bootstrap.Modal(
      document.getElementById('categoriaModal')
    );
    this.toastInstance = new window.bootstrap.Toast(
      document.getElementById('successToast')
    );
    this.confirmModalInstance = new window.bootstrap.Modal(
      document.getElementById('confirmarEliminacionModal')
    );
  }

  openModal(mode: 'add' | 'edit', categoria?: Categoria) {
    this.isEditMode = mode === 'edit';
    this.mensajeError = null;

    if (this.isEditMode && categoria) {
      this.currentCategoriaId = categoria.id;
      this.categoriaForm.patchValue({
        nombre: categoria.nombre,
      });
    } else {
      this.categoriaForm.reset();
      this.currentCategoriaId = null;
    }

    this.modalInstance.show();
  }

  onSubmit() {
    if (this.categoriaForm.invalid) {
      return;
    }

    // Generar nuevo ID único basado en el máximo ID existente
    const maxId = this.categorias.reduce(
      (max, cat) => (cat.id > max ? cat.id : max),
      0
    );
    const nuevaCategoria = {
      id: this.currentCategoriaId ? this.currentCategoriaId : maxId + 1,
      nombre: this.categoriaForm.value.nombre,
      productos: [],
    };

    if (this.isEditMode) {
      const index = this.categorias.findIndex(
        (cat) => cat.id === this.currentCategoriaId
      );
      if (index !== -1) {
        this.categorias[index] = nuevaCategoria;
        this.mensajeExito = 'Categoría editada con éxito';
      }
    } else {
      this.categorias.push(nuevaCategoria);
      this.mensajeExito = 'Categoría agregada con éxito';
    }

    this.modalInstance.hide();
    this.toastInstance.show();
    this.onSearch(); // Actualiza la búsqueda
  }

  confirmarEliminacion(categoria: Categoria) {
    this.categoriaSeleccionada = categoria;
    this.confirmModalInstance.show();
  }

  eliminarCategoria(categoria: Categoria | null) {
    if (!categoria) return;

    if (categoria.productos.length > 0) {
      this.mensajeError = `No se puede eliminar la categoría "${categoria.nombre}" porque tiene productos asociados.`;
      this.confirmModalInstance.hide();
      setTimeout(() => {
        this.cerrarMensajeError();
      }, 3000);
    } else {
      this.categorias = this.categorias.filter(
        (cat) => cat.id !== categoria.id
      );
      this.mensajeError = null;
      this.mensajeExito = 'Categoría eliminada con éxito';
      this.toastInstance.show();
      this.confirmModalInstance.hide();
      this.onSearch();
    }
  }

  cerrarMensajeError() {
    this.mensajeError = null;
    this.cdr.detectChanges();
  }

  // Corrección en la búsqueda
  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();
    if (term !== '') {
      this.filteredCategorias = this.categorias.filter((categoria) =>
        categoria.nombre.toLowerCase().includes(term)
      );
    } else {
      this.filteredCategorias = [...this.categorias]; // Mostrar todas las categorías si no hay término de búsqueda
    }

    // Actualización de la paginación después de la búsqueda
    this.totalItems = this.filteredCategorias.length;
    this.totalPages = Math.ceil(this.totalItems / this.limit);
    this.cargarCategorias(1); // Reiniciar a la primera página después de la búsqueda
    this.cdr.detectChanges();
  }

  cargarCategorias(page: number) {
    const start = (page - 1) * this.limit;
    const end = start + this.limit;
    this.filteredCategorias = this.filteredCategorias.slice(start, end);
    this.currentPage = page;
    this.cdr.detectChanges();
  }

  onPageChange(page: number) {
    this.cargarCategorias(page);
  }
}
