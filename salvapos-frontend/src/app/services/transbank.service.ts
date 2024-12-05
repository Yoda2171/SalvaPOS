import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class TransbankService {
  private readonly baseUrl = environment.apiUrl + '/transbank';
  constructor(private readonly http: HttpClient) {}
  iniciarTransaccion(data: {
    amount: number;
    sessionId: string;
    buyOrder: string;
    returnUrl: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/iniciar`, data);
  }

  // Método para confirmar una transacción
  confirmarTransaccion(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/confirmar`, { token });
  }
}
