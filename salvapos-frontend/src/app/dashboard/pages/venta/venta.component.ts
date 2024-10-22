import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css']
})
export class VentaComponent {
  carrito = [
    { nombre: 'Producto 1', precio: 2085, cantidad: 1, image: 'assets/img/producto1.jpg' },
    { nombre: 'Producto 2', precio: 2085, cantidad: 1, image: 'assets/img/producto2.jpg' },
  ];

  metodoPago: string = '';  // Puede ser 'tarjeta' o 'efectivo'
  tipoTarjeta: string = '';  // Puede ser 'credito' o 'debito'
  montoTarjeta: number = 0;
  montoEfectivo: number = 0;  // Monto ingresado al pagar en efectivo
  cambio: number = 0;  // Cambio que debe devolverse
  montoMaximo: number = 100000;  // Límite máximo de 100,000 pesos (CLP)

  // Método para aumentar la cantidad de un producto en el carrito
  aumentarCantidad(item: any) {
    item.cantidad++;
  }

  // Método para disminuir la cantidad de un producto en el carrito
  disminuirCantidad(item: any) {
    if (item.cantidad > 1) {
      item.cantidad--;
    }
  }

  // Método para eliminar un producto del carrito
  eliminarItem(item: any) {
    this.carrito = this.carrito.filter(i => i !== item);
  }

  // Calcular el total de la compra
  calcularTotal() {
    return this.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }

  // Método para calcular el monto restante a pagar en efectivo si la tarjeta no cubre el total
  calcularMontoEfectivo() {
    const total = this.calcularTotal();
    return total - this.montoTarjeta;
  }

  // Método para calcular el cambio a devolver
  calcularCambio() {
    const total = this.calcularTotal();
    this.cambio = this.montoEfectivo - total;
  }

  // Método para reiniciar el formulario después de cada pago
  resetFormulario() {
    this.metodoPago = '';  // Reiniciar el método de pago
    this.tipoTarjeta = '';  // Reiniciar el tipo de tarjeta
    this.montoTarjeta = 0;  // Reiniciar el monto de tarjeta
    this.montoEfectivo = 0;  // Reiniciar el monto en efectivo
    this.cambio = 0;  // Reiniciar el cambio
  }

  realizarCompra() {
    const total = this.calcularTotal();

    if (total > this.montoMaximo) {
      alert(`El total no puede exceder los $${this.montoMaximo}.`);
      return;
    }

    // Validación de pago con tarjeta
    if (this.metodoPago === 'tarjeta') {
      if (!this.tipoTarjeta || this.montoTarjeta <= 0) {
        alert('Por favor, seleccione un tipo de tarjeta e ingrese un monto válido para el pago con tarjeta.');
        return;
      }

      if (this.montoTarjeta < total) {
        alert(`Pago parcial con ${this.tipoTarjeta}: $${this.montoTarjeta}. El resto ($${this.calcularMontoEfectivo()}) se pagará con efectivo.`);
      } else {
        alert('Compra realizada con éxito');
      }

      this.resetFormulario();
    }

    // Validación de pago con efectivo
    if (this.metodoPago === 'efectivo') {
      if (this.montoEfectivo <= 0) {
        alert('Por favor, ingrese un monto en efectivo válido.');
        return;
      }

      if (this.montoEfectivo < total) {
        alert('El monto ingresado es insuficiente para pagar en efectivo.');
        return;
      }

      // Calcular el cambio solo cuando el pago es confirmado
      this.calcularCambio();
      alert(`Compra realizada con éxito. Se ha devuelto ${this.cambio.toLocaleString('es-CL')} pesos.`);
      this.resetFormulario();
    }
  }
}
