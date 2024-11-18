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

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
    });

    this.loading$ = this.authService.loading$;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      console.log('Registro', registerData);

      // Implement your registration logic here, e.g., call a service to register the user
      this.authService.register(registerData).subscribe(
        () => {
          this.emailExists = false;
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Registration failed', error);

          this.emailExists = true;

          this.registerForm.get('email')?.reset();
        }
      );
    } else {
      console.log('Formulario inválido');
    }
  }
}
