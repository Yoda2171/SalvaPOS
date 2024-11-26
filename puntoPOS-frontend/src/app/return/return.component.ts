import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransbankService } from '../services/transbank.service';
@Component({
  selector: 'app-return',
  templateUrl: './return.component.html',
  styleUrls: ['./return.component.css'],
})
export class ReturnComponent implements OnInit {
  resultado: any;

  constructor(private route: ActivatedRoute, private transbankService: TransbankService) {}

  ngOnInit(): void {
    // Obtener el token_ws de la URL
    const token = this.route.snapshot.queryParamMap.get('token_ws');

    if (token) {
      // Confirmar la transacción en el backend
      this.transbankService.confirmarTransaccion(token).subscribe({
        next: (response) => {
          console.log('Respuesta de confirmarTransaccion:', response);
          this.resultado = response;
        },
        error: (error) => {
          console.error('Error al confirmar la transacción:', error);
        },
        complete: () => {
          console.log('Proceso de confirmación completado.');
        },
      });
    } else {
      console.error('No se encontró el token_ws en la URL');
    }
  }
}
