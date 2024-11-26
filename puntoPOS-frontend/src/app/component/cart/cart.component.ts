import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { TransbankService } from '../../services/transbank.service';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cart = inject(CartService);
  constructor(private transbankService: TransbankService){}
  iniciarPago() {
    const paymentData = {
      amount: this.cart.calcularPrecioTotal(), // Monto de la transacción
      sessionId: 'random', // Identificador de sesión
      buyOrder: `order-${Date.now()}`, // Orden única basada en el tiempo
      returnUrl: 'http://localhost:4200/return', // URL de retorno al frontend
    };

    this.transbankService.iniciarTransaccion(paymentData).subscribe({
      next: (response) => {
        if (response && response.token) {
          const redirectUrl = `${response.url}?token_ws=${response.token}`;
          console.log('Redirigiendo a:', redirectUrl);
          window.location.href = redirectUrl;
        } else {
          console.error('La respuesta no contiene un token válido:', response);
        }
      },
      error: (error) => {
        console.error('Error al iniciar la transacción:', error);
      },
      complete: () => {
        console.log('Suscripción completada.');
      },
    });
  }
}
