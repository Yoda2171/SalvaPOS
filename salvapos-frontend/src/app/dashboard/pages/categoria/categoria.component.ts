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
import { CategoriaService } from '../../../services/categoria.service';
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
  limit: number = 15; // Categorías por página
  totalItems: number = 0; // Total de categorías
  totalPages: number = 0; // Total de páginas

  private modalInstance: any; // Modal de Bootstrap
  private toastInstance: any; // Toast de Bootstrap
  private confirmModalInstance: any; // Modal de confirmación de eliminación

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly categoriaService: CategoriaService // Inyectar el servicio
  ) {}

  ngOnInit(): void {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
    });

    this.cargarCategorias(this.currentPage); // Cargar las categorías al iniciar

    // Check if window is defined before using it
    if (typeof window !== 'undefined') {
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
  }

  cargarCategorias(page: number): void {
    this.categoriaService
      .getCategorias(this.searchTerm, page, this.limit)
      .subscribe(
        (response) => {
          this.categorias = response.data;
          this.filteredCategorias = [...this.categorias]; // Llenar la tabla con las categorías
          this.totalItems = response.totalItems;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error al cargar las categorías:', error);
        }
      );
  }

  openModal(mode: 'add' | 'edit', categoria?: Categoria) {
    this.isEditMode = mode === 'edit';
    this.mensajeError = null;

    if (this.isEditMode && categoria) {
      this.currentCategoriaId = categoria.id ?? null;
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

    const nuevaCategoria = {
      nombre: this.categoriaForm.value.nombre, // Solo enviar el nombre
    };

    if (this.isEditMode) {
      // Editar categoría existente
      this.categoriaService
        .updateCategoria(this.currentCategoriaId!, nuevaCategoria)
        .subscribe(() => {
          this.mensajeExito = 'Categoría editada con éxito';
          this.cargarCategorias(this.currentPage);
          this.modalInstance.hide();
          this.toastInstance.show();
        });
    } else {
      // Crear nueva categoría
      this.categoriaService.createCategoria(nuevaCategoria).subscribe(() => {
        this.mensajeExito = 'Categoría agregada con éxito';
        this.cargarCategorias(this.currentPage);
        this.modalInstance.hide();
        this.toastInstance.show();
      });
    }
  }

  confirmarEliminacion(categoria: Categoria) {
    this.categoriaSeleccionada = categoria;
    this.confirmModalInstance.show();
  }

  eliminarCategoria(categoria: Categoria | null) {
    if (!categoria) return;

    if (categoria.productos && categoria.productos.length > 0) {
      this.mensajeError = `No se puede eliminar la categoría "${categoria.nombre}" porque tiene productos asociados.`;
      this.confirmModalInstance.hide();
      setTimeout(() => {
        this.cerrarMensajeError();
      }, 3000);
    } else {
      if (categoria.id !== undefined) {
        this.categoriaService.deleteCategoria(categoria.id).subscribe(() => {
          this.mensajeExito = 'Categoría eliminada con éxito';

          // Calcular cuántos elementos hay en la página actual después de eliminar
          const itemsEnPagina = this.filteredCategorias.length - 1; // Restar uno porque acabas de eliminar una categoría
          const maxPages = Math.ceil(this.totalItems / this.limit);

          // Si no quedan elementos en la página actual y no estamos en la primera página, retrocedemos una página
          if (itemsEnPagina === 0 && this.currentPage > 1) {
            this.currentPage--;
          }

          this.cargarCategorias(this.currentPage); // Recargar las categorías para la nueva página
          this.confirmModalInstance.hide();
          this.toastInstance.show();
        });
      }
    }
  }

  cerrarMensajeError() {
    this.mensajeError = null;
    this.cdr.detectChanges();
  }

  onSearch() {
    this.cargarCategorias(1); // Reiniciar la paginación al buscar
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) {
      return; // No hacemos nada si intentamos acceder a una página inválida
    }
    this.currentPage = page;
    this.cargarCategorias(page);
  }
}
