import { Component } from '@angular/core';

@Component({
  selector: 'app-inventario',
  standalone: true,
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent {
  onSubmit() {
    console.log("Medicamento guardado correctamente.");
    // Aquí puedes agregar la lógica para manejar el formulario
  }
}
