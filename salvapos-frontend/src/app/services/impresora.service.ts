import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ImpresoraService {
  private readonly apiUrl = 'http://localhost:8000/imprimir'; // URL del servidor HTTP ESC POS de Parzibyte

  // BehaviorSubject para el estado de carga
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable(); // Observable para el componente

  constructor(private readonly http: HttpClient) {}

  imprimirBoleta(
    nombreImpresora: string,
    contenidoBoleta: string
  ): Promise<void> {
    // Iniciar el estado de carga
    this.loadingSubject.next(true);

    // Formatear los datos en el formato esperado por la API
    const data = {
      serial: '', // Puede estar vacío o contener el número de serie
      nombreImpresora, // Nombre de la impresora, se recibe como parámetro
      operaciones: [
        {
          nombre: 'EscribirTexto',
          argumentos: [contenidoBoleta], // Contenido de la boleta como un solo string
        },
      ],
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http
      .post<void>(this.apiUrl, data, { headers })
      .pipe(
        finalize(() => {
          // Finalizar el estado de carga después de que se complete la solicitud
          this.loadingSubject.next(false);
        })
      )
      .toPromise();
  }
}
