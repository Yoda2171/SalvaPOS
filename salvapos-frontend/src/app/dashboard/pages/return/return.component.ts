import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TransbankService } from '../../../services/transbank.service';
import { ActivatedRoute } from '@angular/router';
import { VentaService } from '../../../services/venta.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-return',
  standalone: true,
  imports: [],
  templateUrl: './return.component.html',
  styleUrl: './return.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReturnComponent {
  resultado: any;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly transbankService: TransbankService,
    private readonly ventaService: VentaService,
    private readonly cartService: CartService
  ) {}

  ngOnInit(): void {
    // Obtener el token_ws de la URL
    const token = this.route.snapshot.queryParamMap.get('token_ws');

    if (token) {
      // Confirmar la transacción en el backend
      this.transbankService.confirmarTransaccion(token).subscribe({
        next: (response) => {
          console.log('Respuesta de confirmarTransaccion:', response);
          this.resultado = response;

          // Crear la venta después de confirmar la transacción
          this.crearVenta();
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

  crearVenta(): void {
    const detalles = this.cartService.getproductos().map((producto) => ({
      productoId: producto.id,
      cantidad: producto.cantidad,
      precioUnitario: producto.precioVenta,
    }));

    const pagos = [
      {
        metodoPagoId: 2, // Debito
        monto: this.cartService.calcularPrecioTotal(),
      },
    ];

    const venta = {
      detalles,
      pagos,
      total: this.cartService.calcularPrecioTotal(),
      userId: 3,
    };

    this.ventaService.createVenta(venta).subscribe({
      next: (response) => {
        console.log('Venta creada exitosamente:', response);
        // Limpiar el carrito después de crear la venta
        this.cartService.clearCart();
      },
      error: (error) => {
        console.error('Error al crear la venta:', error);
      },
      complete: () => {
        console.log('Proceso de creación de venta completado.');
      },
    });
  }
}
