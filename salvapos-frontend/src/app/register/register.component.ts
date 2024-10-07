import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // Importa FormsModule

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,  // Componente standalone
  imports: [FormsModule]  // Importa FormsModule aquí
})
export class RegisterComponent {
  fullname: string = '';
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    console.log('Registro exitoso');
    this.router.navigate(['/login']);  // Redirige al login después del registro
  }
}
