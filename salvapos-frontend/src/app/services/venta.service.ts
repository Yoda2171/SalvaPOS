import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Venta, VentaAPI } from '../dashboard/Interface/venta.interface';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  SoldCategoria,
  SoldMetodoPago,
  SoldProductDto,
  SoldVenta,
} from '../dashboard/Interface/soldProduct.interface';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/venta';

  // BehaviorSubjects para el estado de carga y los datos
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly ventaSubject = new BehaviorSubject<Venta | null>(null);

  // Observables para el estado de carga y los datos
  loading$ = this.loadingSubject.asObservable();
  venta$ = this.ventaSubject.asObservable();

  constructor() {}

  createVenta(venta: any): Observable<Venta> {
    this.loadingSubject.next(true); // Iniciar el estado de carga
    console.log(venta);
    return this.http.post<Venta>(this.apiUrl, venta).pipe(
      tap((data) => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  getVentaById(ventaId: string): Observable<Venta> {
    this.loadingSubject.next(true); // Iniciar el estado de carga
    const url = `${this.apiUrl}/${ventaId}`; // Construir la URL para la solicitud
    return this.http.get<Venta>(url).pipe(
      tap((data) => {
        this.ventaSubject.next(data); // Actualizar el BehaviorSubject con la venta
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

  //productos-vendidos/venta en un range de fechas

  productosVendidos(
    startDate: string,
    endDate: string
  ): Observable<SoldProductDto[]> {
    this.loadingSubject.next(true); // Iniciar el estado de carga
    const url = `${this.apiUrl}/productos-vendidos/venta?startDate=${startDate}&endDate=${endDate}`; // Construir la URL para la solicitud
    return this.http.get<SoldProductDto[]>(url).pipe(
      tap(() => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  categoriasVendidas(
    startDate: string,
    endDate: string
  ): Observable<SoldCategoria[]> {
    this.loadingSubject.next(true); // Iniciar el estado de carga
    const url = `${this.apiUrl}/categorias-vendidos/venta?startDate=${startDate}&endDate=${endDate}`; // Construir la URL para la solicitud
    return this.http.get<SoldCategoria[]>(url).pipe(
      tap(() => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  metodoPagoVendidos(
    startDate: string,
    endDate: string
  ): Observable<SoldMetodoPago[]> {
    this.loadingSubject.next(true); // Iniciar el estado de carga
    const url = `${this.apiUrl}/metodoPago-vendidos/venta?startDate=${startDate}&endDate=${endDate}`; // Construir la URL para la solicitud
    return this.http.get<SoldMetodoPago[]>(url).pipe(
      tap(() => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  ventasVendidas(startDate: string, endDate: string): Observable<SoldVenta[]> {
    this.loadingSubject.next(true); // Iniciar el estado de carga
    const url = `${this.apiUrl}/ventasPorDia/venta?startDate=${startDate}&endDate=${endDate}`; // Construir la URL para la solicitud
    return this.http.get<SoldVenta[]>(url).pipe(
      tap(() => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }
}
