import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { Observable } from 'rxjs';
import { UserService } from '../../../../services/user.service';
import { Modal } from 'bootstrap';
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
  forgotPasswordForm: FormGroup;
  invalidCredentials: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  loading$: Observable<boolean>;

  @ViewChild('forgotPasswordModal') forgotPasswordModal!: ElementRef;
  @ViewChild('successToast') successToast!: ElementRef;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
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

  requestPasswordReset() {
    if (this.forgotPasswordForm.invalid) {
      this.errorMessage = 'Por favor ingresa un correo válido.';
      return;
    }

    const email = this.forgotPasswordForm.value.email;

    this.userService.requestPassword({ email }).subscribe(
      () => {
        alert('Solicitud de restablecimiento enviada.');
        setTimeout(() => {
          location.reload();
        }, 500);
      },
      (error) => {
        if (error.error.message === 'User not found') {
          alert('Este correo no esta ingresado en el sistema.');

          setTimeout(() => {
            location.reload();
          }, 500);

          return location.reload();
        }

        alert('Error al solicitar restablecimiento. intenta de nuevo.');
        console.error('Error al solicitar restablecimiento', error);
        this.errorMessage =
          error.error.message || 'Error al solicitar restablecimiento.';
        this.cdr.detectChanges();
      }
    );
  }
}
