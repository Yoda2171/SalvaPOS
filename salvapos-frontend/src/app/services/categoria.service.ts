import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Categoria,
  Pagination,
} from '../dashboard/Interface/categoria.inteface';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/categoria';

  // BehaviorSubjects para el estado de carga y los datos
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly categoriasSubject = new BehaviorSubject<Pagination | null>(
    null
  );
  private readonly categoriaSubject = new BehaviorSubject<Categoria | null>(
    null
  );

  // Observables para el estado de carga y los datos
  loading$ = this.loadingSubject.asObservable();
  categorias$ = this.categoriasSubject.asObservable();
  categoria$ = this.categoriaSubject.asObservable();

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

    this.loadingSubject.next(true); // Iniciar el estado de carga

    return this.http.get<Pagination>(this.apiUrl, { params }).pipe(
      tap((data) => {
        this.categoriasSubject.next(data); // Emitir los datos
      }),
      finalize(() => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  getCategoriaById(id: number): Observable<Categoria> {
    const url = `${this.apiUrl}/${id}`;

    this.loadingSubject.next(true); // Iniciar el estado de carga

    return this.http.get<Categoria>(url).pipe(
      tap((data) => {
        this.categoriaSubject.next(data); // Emitir los datos
      }),
      finalize(() => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  createCategoria(categoria: Categoria): Observable<Categoria> {
    this.loadingSubject.next(true); // Iniciar el estado de carga

    return this.http
      .post<Categoria>(this.apiUrl, { nombre: categoria.nombre })
      .pipe(
        tap((data) => {
          this.loadingSubject.next(false); // Finalizar el estado de carga
        })
      );
  }

  updateCategoria(id: number, categoria: Categoria): Observable<Categoria> {
    const url = `${this.apiUrl}/${id}`;

    this.loadingSubject.next(true); // Iniciar el estado de carga

    return this.http.patch<Categoria>(url, { nombre: categoria.nombre }).pipe(
      tap((data) => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  deleteCategoria(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    this.loadingSubject.next(true); // Iniciar el estado de carga

    return this.http.delete<void>(url).pipe(
      tap(() => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }

  getCategoriasAll(): Observable<Categoria[]> {
    this.loadingSubject.next(true); // Iniciar el estado de carga

    return this.http.get<Categoria[]>(this.apiUrl + '/all').pipe(
      tap((data) => {
        this.loadingSubject.next(false); // Finalizar el estado de carga
      })
    );
  }
}
