import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductosComponent } from './navbar_productos/productos.component';
import { BodyProductosComponent } from './body-productos/body-productos.component';
import { LoginComponent } from './login/login.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProductosComponent, BodyProductosComponent, LoginComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'salvapos';
}
