import { Component } from '@angular/core';
import { BodyProductosComponent } from '../body-productos/body-productos.component';


@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [BodyProductosComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent {
  Username = "Usuario";
}
