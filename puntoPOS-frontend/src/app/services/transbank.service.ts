import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TransbankService {
  private baseUrl = 'http://localhost:3000/transbank';
  constructor(private http: HttpClient) { }
  iniciarTransaccion(data: { amount: number; sessionId: string; buyOrder: string; returnUrl: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/iniciar`, data);
  }

  // Método para confirmar una transacción
  confirmarTransaccion(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/confirmar`, { token });
  }
}
