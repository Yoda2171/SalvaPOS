import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Importamos RouterModule
import { LoginComponent } from './login/login.component'; // Importamos el LoginComponent

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule, LoginComponent] // Importamos RouterModule aquí
})
export class AppComponent {
  title = 'SalvaPOS';
}
