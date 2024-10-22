import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Importa FormsModule aquí
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-venta',
  standalone: true,  // Asegúrate de que está marcado como standalone
  imports: [CommonModule, FormsModule],  // Aquí importas FormsModule
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css']
})
export class VentaComponent {
  carrito = [
    { nombre: 'Producto 1', precio: 285, cantidad: 1, image: 'assets/img/producto1.jpg' },
    { nombre: 'Producto 2', precio: 285, cantidad: 1, image: 'assets/img/producto2.jpg' },
  ];

  metodoPago: string = '';
  montoTarjeta: number = 0;

  calcularTotal() {
    return this.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }

  calcularMontoEfectivo() {
    return this.calcularTotal() - this.montoTarjeta;
  }

  disminuirCantidad(item: any) {
    if (item.cantidad > 1) {
      item.cantidad--;
    }
  }

  aumentarCantidad(item: any) {
    item.cantidad++;
  }

  eliminarItem(item: any) {
    this.carrito = this.carrito.filter(i => i !== item);
  }

  realizarCompra() {
    if (this.metodoPago === 'mixto' && (this.montoTarjeta > this.calcularTotal() || this.montoTarjeta <= 0)) {
      alert('Monto incorrecto para pago mixto.');
      return;
    }
    // Lógica para procesar la compra
    alert('Compra realizada con éxito');
  }
}
