import { Component } from '@angular/core';
import { ProductosComponent } from '../navbar_productos/productos.component';
@Component({
  selector: 'app-body-productos',
  standalone: true,
  imports: [ProductosComponent  ],
  templateUrl: './body-productos.component.html',
  styleUrl: './body-productos.component.css'
})
export class BodyProductosComponent {
  username = "Cliente_prueba_vista"
}
