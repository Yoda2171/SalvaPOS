import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import {
  RequestResetPassword,
  ResetPassword,
} from '../dashboard/Interface/auth.interface';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/user';

  // BehaviorSubject for loading state
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor() {}

  requestPassword(
    requestResetPasswordDto: RequestResetPassword
  ): Observable<any> {
    this.loadingSubject.next(true); // Start loading state

    return this.http
      .patch(`${this.apiUrl}/request-password`, requestResetPasswordDto)
      .pipe(
        tap((response) => {
          console.log('Request password successful', response);
        }),
        finalize(() => {
          this.loadingSubject.next(false); // End loading state
        })
      );
  }

  resetPassword(resetPasswordDto: ResetPassword): Observable<any> {
    this.loadingSubject.next(true); // Start loading state

    return this.http
      .patch(`${this.apiUrl}/resetpassword`, resetPasswordDto)
      .pipe(
        tap((response) => {
          console.log('Reset password successful', response);
        }),
        finalize(() => {
          this.loadingSubject.next(false); // End loading state
        })
      );
  }
}
