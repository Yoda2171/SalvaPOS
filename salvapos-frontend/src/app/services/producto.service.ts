import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize, catchError } from 'rxjs/operators';
import {
  Pagination,
  Producto,
} from '../dashboard/Interface/producto.interface';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/producto';

  // BehaviorSubjects para el estado de carga y los datos
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly productosSubject = new BehaviorSubject<Pagination | null>(
    null
  );
  private readonly productoSubject = new BehaviorSubject<Producto | null>(null);
  private readonly checkLoadingSubject = new BehaviorSubject<boolean>(false);

  // Observables para el estado de carga y los datos
  loading$ = this.loadingSubject.asObservable();
  productos$ = this.productosSubject.asObservable();
  checkLoading$ = this.checkLoadingSubject.asObservable();
  producto$ = this.productoSubject.asObservable();

  constructor() {}

  getProductos(
    search: string = '',
    page: number = 1,
    limit: number = 15
  ): Observable<Pagination> {
    let params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('limit', limit.toString());

    this.loadingSubject.next(true); // Iniciar el estado de carga

    return this.http.get<Pagination>(this.apiUrl, { params }).pipe(
      tap((data) => {
        this.productosSubject.next(data); // Emitir los datos
      }),
      finalize(() => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  getProductoById(id: number): Observable<Producto> {
    const url = `${this.apiUrl}/${id}`;

    this.loadingSubject.next(true); // Iniciar el estado de carga

    return this.http.get<Producto>(url).pipe(
      tap((data) => {
        this.productoSubject.next(data); // Emitir los datos
      }),
      finalize(() => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  createProducto(producto: Producto): Observable<Producto> {
    console.log(producto);
    this.loadingSubject.next(true); // Iniciar el estado de carga

    return this.http.post<Producto>(this.apiUrl, producto).pipe(
      tap((data) => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  updateProducto(id: number, producto: Producto): Observable<Producto> {
    const url = `${this.apiUrl}/${id}`;

    console.log(producto.nombre);
    console.log(url);
    this.loadingSubject.next(true); // Iniciar el estado de carga

    return this.http.patch<Producto>(url, producto).pipe(
      tap((data) => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  ajustarStock(id: number, cantidad: number): Observable<Producto> {
    console.log(id, cantidad);
    const url = `${this.apiUrl}/ajustarinventario/${id}`;

    this.loadingSubject.next(true); // Iniciar el estado de carga

    return this.http.patch<Producto>(url, { cantidadAjuste: cantidad }).pipe(
      tap((data) => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  checkIfProductExists(
    nombre: string,
    codigoBarras: string
  ): Observable<boolean> {
    const url = `${this.apiUrl}/verificar-existencia/producto`;
    const params = new HttpParams()
      .set('nombre', nombre)
      .set('codigoBarras', codigoBarras);

    this.checkLoadingSubject.next(true); // Start loading for the check

    return this.http.get<boolean>(url, { params }).pipe(
      tap(() => this.checkLoadingSubject.next(false)), // Stop loading when the request is complete
      catchError((error) => {
        this.checkLoadingSubject.next(false); // Stop loading in case of an error
        throw error; // Propagate the error
      })
    );
  }
}
