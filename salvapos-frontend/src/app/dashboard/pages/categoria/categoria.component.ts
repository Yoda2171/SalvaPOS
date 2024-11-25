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
import { catchError, Observable, of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
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
  categorias: Categoria[] = [];
  filteredCategorias: Categoria[] = [];
  categoriaForm!: FormGroup;
  isEditMode = false;
  currentCategoriaId: number | null = null;
  categoriaSeleccionada: Categoria | null = null;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;
  searchTerm = '';
  userRole: string | null = null;

  // Paginación
  currentPage = 1;
  limit = 15;
  totalItems = 0;
  totalPages = 0;

  private modalInstance: any;
  private toastInstance: any;
  private confirmModalInstance: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly categoriaService: CategoriaService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeModal();
    this.loadCategories(this.currentPage);

    const currentUser = this.authService.getCurrentUser();
    this.userRole = currentUser ? currentUser.role : null;
  }

  initializeForm(): void {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
    });
  }

  initializeModal(): void {
    if (typeof window !== 'undefined') {
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

  loadCategories(page: number): void {
    this.categoriaService
      .getCategorias(this.searchTerm, page, this.limit)
      .subscribe(
        (response) => this.handleCategoryResponse(response),
        (error) => this.handleError(error)
      );
  }

  handleCategoryResponse(response: any): void {
    this.categorias = response.data;
    this.filteredCategorias = [...this.categorias];
    this.totalItems = response.totalItems;
    this.totalPages = response.totalPages;
    this.currentPage = response.currentPage;
    this.cdr.detectChanges();
  }

  handleError(error: any): void {
    console.error('Error al cargar las categorías:', error);
  }

  openModal(mode: 'add' | 'edit', categoria?: Categoria): void {
    this.isEditMode = mode === 'edit';
    this.mensajeError = null;

    if (this.isEditMode && categoria) {
      this.currentCategoriaId = categoria.id ?? null;
      this.categoriaForm.patchValue({ nombre: categoria.nombre });
    } else {
      this.categoriaForm.reset();
      this.currentCategoriaId = null;
    }

    this.modalInstance.show();
  }

  onSubmit(): void {
    if (this.categoriaForm.invalid) return;

    const nuevaCategoria = { nombre: this.categoriaForm.value.nombre };

    const operation$ = this.isEditMode
      ? this.categoriaService.updateCategoria(
          this.currentCategoriaId!,
          nuevaCategoria
        )
      : this.categoriaService.createCategoria(nuevaCategoria);

    operation$
      .pipe(catchError((error) => this.handleFormError(error)))
      .subscribe((response) => {
        if (response) {
          this.mensajeExito = this.isEditMode
            ? 'Categoría editada con éxito'
            : 'Categoría agregada con éxito';
          this.loadCategories(this.currentPage);
          this.modalInstance.hide();
          this.toastInstance.show();
        }
      });
  }

  handleFormError(error: any): Observable<any> {
    this.mensajeError =
      error.error.message || 'Error al procesar la categoría.';
    this.cdr.detectChanges();
    this.modalInstance.hide();
    setTimeout(() => this.clearErrorMessage(), 3000);
    return of(null);
  }

  clearErrorMessage(): void {
    this.mensajeError = null;
    this.cdr.detectChanges();
  }

  confirmDeletion(categoria: Categoria): void {
    this.categoriaSeleccionada = categoria;
    this.confirmModalInstance.show();
  }

  deleteCategory(categoria: Categoria | null): void {
    if (!categoria) return;

    if (categoria.productos?.length) {
      this.showDeletionError(
        `No se puede eliminar la categoría "${categoria.nombre}" porque tiene productos asociados.`
      );
    } else {
      this.categoriaService.deleteCategoria(categoria.id!).subscribe(() => {
        this.mensajeExito = 'Categoría eliminada con éxito';
        this.adjustPaginationAfterDeletion();
        this.loadCategories(this.currentPage);
        this.confirmModalInstance.hide();
        this.toastInstance.show();
      });
    }
  }

  showDeletionError(message: string): void {
    this.mensajeError = message;
    this.confirmModalInstance.hide();
    setTimeout(() => this.clearErrorMessage(), 3000);
  }

  adjustPaginationAfterDeletion(): void {
    const itemsInPage = this.filteredCategorias.length - 1;
    const maxPages = Math.ceil(this.totalItems / this.limit);

    if (itemsInPage === 0 && this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onSearch(): void {
    this.loadCategories(1); // Reset pagination on search
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadCategories(page);
  }
}
