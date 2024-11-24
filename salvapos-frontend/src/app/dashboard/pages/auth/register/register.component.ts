import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterComponent {
  registerForm: FormGroup;
  emailExists: boolean = false;
  loading$: Observable<boolean>;

  roles: { id: number; name: string }[] = [
    { id: 1, name: 'Administrador' },
    { id: 2, name: 'Cajero' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      roleId: ['', Validators.required],
    });

    this.loading$ = this.authService.loading$;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      console.log('Registro', registerData);

      registerData.roleId = parseInt(registerData.roleId);

      this.authService.register(registerData).subscribe(
        () => {
          this.emailExists = false;
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Registration failed', error);

          // Manejo del error de correo ya existente
          this.emailExists = true;
          this.registerForm.get('email')?.setErrors({ emailExists: true });
        }
      );
    } else {
      // Marca todos los controles como tocados para mostrar mensajes de error
      this.markFormGroupTouched(this.registerForm);
      console.log('Formulario inválido', this.registerForm.value);
    }
  }

  // Método auxiliar para marcar todos los controles como tocados
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
}
