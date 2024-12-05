import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransbankService } from '../../../services/transbank.service';
import { CartService } from '../../../services/cart.service';
import { environment } from '../../../../environment/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export default class CartComponent {
  trackById(index: number, item: any): number {
    return item.id;
  }
  cart = inject(CartService);
  constructor(
    private readonly transbankService: TransbankService,
    private readonly cartService: CartService
  ) {}
  iniciarPago() {
    const paymentData = {
      amount: this.cart.calcularPrecioTotal(), // Monto de la transacción
      sessionId: 'random', // Identificador de sesión
      buyOrder: `order-${Date.now()}`, // Orden única basada en el tiempo
      returnUrl: environment.apiUrlFront + '/dashboard/return', // URL de retorno al frontend
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

  incrementarCantidad(id: number) {
    this.cartService.incrementQuantity(id);
  }

  reducirCantidad(id: number) {
    this.cartService.decrementQuantity(id);
  }

  eliminarItem(id: number) {
    this.cartService.removeItem(id);
  }

  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Formateo con puntos como separadores de miles
  }
}
