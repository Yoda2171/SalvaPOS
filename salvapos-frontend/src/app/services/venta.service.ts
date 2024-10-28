import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Venta, VentaAPI } from '../dashboard/Interface/venta.interface';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://[::1]:3000/venta';

  // BehaviorSubjects para el estado de carga y los datos
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly ventaSubject = new BehaviorSubject<Venta | null>(null);

  // Observables para el estado de carga y los datos
  loading$ = this.loadingSubject.asObservable();
  venta$ = this.ventaSubject.asObservable();

  constructor() {}

  createVenta(venta: VentaAPI): Observable<Venta> {
    this.loadingSubject.next(true); // Iniciar el estado de carga
    console.log(venta);
    return this.http.post<Venta>(this.apiUrl, venta).pipe(
      tap((data) => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  obtenerVentasPorFecha(fecha: string): Observable<Venta[]> {
    this.loadingSubject.next(true); // Iniciar el estado de carga
    const url = `${this.apiUrl}?fecha=${fecha}`; // Construir la URL para la solicitud
    return this.http.get<Venta[]>(url).pipe(
      tap(() => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  devolucionVenta(ventaId: string): Observable<Venta> {
    this.loadingSubject.next(true); // Iniciar el estado de carga
    const url = `${this.apiUrl}/${ventaId}/devolucion`; // Construir la URL para la solicitud
    return this.http.delete<Venta>(url, {}).pipe(
      tap(() => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }
}
