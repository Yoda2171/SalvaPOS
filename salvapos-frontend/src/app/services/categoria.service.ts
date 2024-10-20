import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Categoria,
  Pagination,
} from '../dashboard/Interface/categoria.inteface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://[::1]:3000/categoria';

  constructor() {}

  getCategorias(
    search: string = '',
    page: number = 1,
    limit: number = 5
  ): Observable<Pagination> {
    let params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<Pagination>(this.apiUrl, { params });
  }

  getCategoriaById(id: number): Observable<Categoria> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Categoria>(url);
  }

  createCategoria(categoria: Categoria): Observable<Categoria> {
    console.log(categoria.nombre);
    return this.http.post<Categoria>(this.apiUrl, { nombre: categoria.nombre });
  }

  updateCategoria(id: number, categoria: Categoria): Observable<Categoria> {
    const url = `${this.apiUrl}/${id}`;

    console.log(categoria.nombre);
    console.log(url);
    return this.http.patch<Categoria>(url, { nombre: categoria.nombre });
  }

  deleteCategoria(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
