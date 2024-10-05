import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root', // Asegúrate de que el selector es 'app-login' si es el que usas en el HTML
  standalone: true,      // Declara que es un componente standalone
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule]
})
export class LoginComponent {

  username: string = '';
  password: string = '';

  onSubmit() {
    if (this.username && this.password) {
      console.log('Iniciando sesión con:', this.username, this.password);
    } else {
      alert('Por favor, complete todos los campos.');
    }
  }
}
