import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MetodoPagoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://[::1]:3000/metodo-pago';

  constructor() {}
}
