import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://[::1]:3000/auth';

  constructor() {}

  login(loginDto: any) {
    return this.http.post(`${this.apiUrl}/login`, loginDto);
  }

  register(registerDto: any) {
    return this.http.post(`${this.apiUrl}/register`, registerDto);
  }
}
