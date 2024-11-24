import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service'; // Este es el servicio que usas para gestionar la autenticación

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterComponent {
  fullname: string = '';
  email: string = '';
  password: string = '';
  role: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    // Aquí llamamos al servicio de autenticación para registrar al usuario
    const newUser = {
      fullname: this.fullname,
      email: this.email,
      password: this.password,
      role: this.role
    };

    // Usamos el servicio para registrar el nuevo usuario
    this.authService.register(newUser).subscribe({
      next: (response) => {
        console.log('Registro exitoso');
        // Redirigimos al login después de un registro exitoso
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al registrar', error);
      }
    });
  }
}
