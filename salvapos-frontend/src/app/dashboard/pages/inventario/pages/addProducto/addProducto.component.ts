import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from '../../../../components/navbar/navbar.component';

@Component({
  selector: 'app-add-producto',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './addProducto.component.html',
  styleUrl: './addProducto.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AddProductoComponent {
  // Lógica del formulario de inventario
  onSubmit() {
    console.log('Datos del medicamento guardados correctamente.');
    // Lógica para manejar el envío de datos
  }
}
