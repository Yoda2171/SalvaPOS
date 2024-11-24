import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    if (this.username && this.password) {
      // Aquí deberías validar el login y redirigir al dashboard si el login es correcto
      this.authService.login({ username: this.username, password: this.password }).subscribe(response => {
        if (response.token) {
          // Guardamos el token en el localStorage
          localStorage.setItem('userToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user)); // Guarda los datos del usuario
          
          // Redirige al dashboard
          this.router.navigate(['/dashboard']);
        } else {
          alert('Credenciales incorrectas');
        }
      });
    } else {
      alert('Por favor, complete todos los campos.');
    }
  }
}
