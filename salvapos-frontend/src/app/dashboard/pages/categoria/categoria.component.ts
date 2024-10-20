import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router'; // Import RouterModule

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

  private modalInstance: any; // Modal de Bootstrap
  private toastInstance: any; // Toast de Bootstrap
  private confirmModalInstance: any; // Modal de confirmación de eliminación

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {} // Añadir ChangeDetectorRef al constructor

  ngOnInit(): void {
    // Inicializar el formulario
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
    });

    // Cargar categorías (simulación)
    this.categorias = [
      { id: 1, nombre: 'Kids', productos: [] },
      { id: 2, nombre: 'Home', productos: [{ id: 1 }] },
    ];

    this.filteredCategorias = this.categorias;

    // Inicializar modal y toast de Bootstrap
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
      // Modo edición: cargar datos de la categoría
      this.currentCategoriaId = categoria.id;
      this.categoriaForm.patchValue({
        nombre: categoria.nombre,
      });
    } else {
      // Modo agregar: reiniciar formulario
      this.categoriaForm.reset();
      this.currentCategoriaId = null;
    }

    // Mostrar el modal
    this.modalInstance.show();
  }

  onSubmit() {
    if (this.categoriaForm.invalid) {
      return;
    }

    const nuevaCategoria = {
      id: this.currentCategoriaId
        ? this.currentCategoriaId
        : this.categorias.length + 1,
      nombre: this.categoriaForm.value.nombre,
      productos: [],
    };

    if (this.isEditMode) {
      // Editar categoría existente
      const index = this.categorias.findIndex(
        (cat) => cat.id === this.currentCategoriaId
      );
      if (index !== -1) {
        this.categorias[index] = nuevaCategoria;
        this.mensajeExito = 'Categoría editada con éxito';
      }
    } else {
      // Agregar nueva categoría
      this.categorias.push(nuevaCategoria);
      this.mensajeExito = 'Categoría agregada con éxito';
    }

    // Cerrar el modal
    this.modalInstance.hide();

    // Mostrar el toast de éxito
    this.toastInstance.show();
    this.onSearch(); // Filtrar las categorías nuevamente
  }

  confirmarEliminacion(categoria: Categoria) {
    this.categoriaSeleccionada = categoria;
    this.confirmModalInstance.show();
  }

  eliminarCategoria(categoria: Categoria | null) {
    if (!categoria) {
      return; // No hacer nada si la categoría es null
    }

    if (categoria.productos.length > 0) {
      // No se puede eliminar si tiene productos
      this.mensajeError = `No se puede eliminar la categoría "${categoria.nombre}" porque tiene productos asociados.`;

      // Cerrar el modal de confirmación
      this.confirmModalInstance.hide();

      // Mostrar el mensaje automáticamente y ocultarlo después de 3 segundos
      setTimeout(() => {
        this.cerrarMensajeError();
      }, 3000); // 3000 milisegundos = 3 segundos
    } else {
      // Eliminar categoría
      this.categorias = this.categorias.filter(
        (cat) => cat.id !== categoria.id
      );
      this.mensajeError = null;
      this.mensajeExito = 'Categoría eliminada con éxito';
      this.toastInstance.show();
      this.confirmModalInstance.hide();
      this.onSearch(); // Actualizar la lista filtrada
    }
  }

  cerrarMensajeError() {
    this.mensajeError = null; // Cerrar el mensaje de error
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  // Método para filtrar las categorías
  onSearch() {
    if (this.searchTerm.trim() !== '') {
      this.filteredCategorias = this.categorias.filter((categoria) =>
        categoria.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredCategorias = this.categorias;
    }
    this.cdr.detectChanges(); // Forzar la actualización de la lista filtrada
  }
}
