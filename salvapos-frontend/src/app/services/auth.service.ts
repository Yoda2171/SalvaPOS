import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://[::1]:3000/auth';

  // BehaviorSubject for loading state
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor() {}

  login(loginDto: any): Observable<any> {
    this.loadingSubject.next(true); // Start loading state

    return this.http.post(`${this.apiUrl}/login`, loginDto).pipe(
      tap((response: any) => {
        console.log('Login successful', response);
        localStorage.setItem('token', response.token);
      }),
      finalize(() => {
        this.loadingSubject.next(false); // End loading state
      })
    );
  }

  getCurrentUser(): any {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token', jwtDecode(token));
      return jwtDecode(token);
    }
    return null;
  }

  register(registerDto: any): Observable<any> {
    this.loadingSubject.next(true); // Start loading state

    return this.http.post(`${this.apiUrl}/register`, registerDto).pipe(
      tap((response) => {
        console.log('Registration successful', response);
      }),
      finalize(() => {
        this.loadingSubject.next(false); // End loading state
      })
    );
  }

  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`);
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
