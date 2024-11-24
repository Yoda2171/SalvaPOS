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
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  loginForm: FormGroup;
  invalidCredentials: boolean = false;
  errorMessage: string = '';
  loading$: Observable<boolean>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.loading$ = this.authService.loading$;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      this.authService.login(loginData).subscribe(
        (response: any) => {
          console.log('Login successful', response);
          this.invalidCredentials = false;
          this.errorMessage = '';

          // Navigate to the dashboard or another page
          this.router.navigate(['/dashboard']);
        },
        (error: any) => {
          console.error('Login failed', error);
          this.invalidCredentials = true;
          this.loginForm.reset();
          this.errorMessage = 'Correo electrónico o contraseña incorrectos.';
        }
      );
    } else {
      console.log('Formulario inválido');
    }
  }
}
