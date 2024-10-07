import { Component } from '@angular/core';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
  standalone: true
})
export class InventarioComponent {
  // Lógica del formulario de inventario
  onSubmit() {
    console.log('Datos del medicamento guardados correctamente.');
    // Lógica para manejar el envío de datos
  }
}
