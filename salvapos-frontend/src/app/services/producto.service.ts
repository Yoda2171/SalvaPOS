import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Pagination,
  Producto,
} from '../dashboard/Interface/producto.interface';
import { delay, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://[::1]:3000/producto';
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

    return this.http.get<Pagination>(this.apiUrl, { params });
  }

  getProductoById(id: number): Observable<Producto> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Producto>(url);
  }

  createProducto(producto: Producto): Observable<Producto> {
    console.log(producto);
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  updateProducto(id: number, producto: Producto): Observable<Producto> {
    const url = `${this.apiUrl}/${id}`;

    console.log(producto.nombre);
    console.log(url);
    return this.http.patch<Producto>(url, producto);
  }

  ajustarStock(id: number, cantidad: number): Observable<Producto> {
    console.log(id, cantidad);
    const url = `${this.apiUrl}/ajustarinventario/${id}`;

    return this.http.patch<Producto>(url, { cantidadAjuste: cantidad });
  }
}
