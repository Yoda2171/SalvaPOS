import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { tap } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './resetPassword.component.html',
  styleUrls: ['./resetPassword.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly notificationService: UserService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      resetToken: ['', [Validators.required]], // El token de reinicio de contraseña
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8), // Contraseña con al menos 8 caracteres
        ],
      ],
    });
  }

  ngOnInit(): void {
    // Obtener el token desde la URL
    this.route.paramMap.subscribe((params) => {
      const token = params.get('token');
      if (token) {
        this.resetPasswordForm.patchValue({ resetToken: token });
      }
      console.log('Token:', token);
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.errorMessage = 'Por favor completa los campos correctamente.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.notificationService
      .resetPassword(this.resetPasswordForm.value)
      .pipe(
        tap({
          next: () => {
            this.router.navigate(['/login']); // Redirigir al login después de resetear
          },
          error: (err) => {
            this.errorMessage =
              err.error.message || 'Error al resetear contraseña';
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          },
        })
      )
      .subscribe();
  }
}
