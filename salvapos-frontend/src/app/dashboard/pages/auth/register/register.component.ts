import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterComponent {
  fullname: string = '';
  email: string = '';
  password: string = '';
  role: string = '';

  constructor(router: Router) {}

  onSubmit() {
    console.log('Registro exitoso');
    /* this.router.navigate(['/login']); */ // Redirige al login después del registro
  }
}
