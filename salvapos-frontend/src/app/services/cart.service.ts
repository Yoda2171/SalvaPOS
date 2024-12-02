import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../dashboard/Interface/producto.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly itemsSubject: BehaviorSubject<Producto[]> =
    new BehaviorSubject<Producto[]>([]);
  items$ = this.itemsSubject.asObservable();

  constructor() {
    const savedCart = localStorage.getItem('cart');
    const initialCart = savedCart ? JSON.parse(savedCart) : [];
    this.itemsSubject = new BehaviorSubject<Producto[]>(initialCart);
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.itemsSubject.value));
  }

  agregar(producto: Producto) {
    const currentItems = this.itemsSubject.value;
    const existingItem = currentItems.find((item) => item.id === producto.id);

    if (existingItem) {
      existingItem.cantidad++;
    } else {
      producto.cantidad = 1;
      currentItems.push(producto);
    }

    this.itemsSubject.next([...currentItems]);
    this.saveCart();
  }

  getproductos() {
    return this.itemsSubject.value;
  }

  calcularPrecioTotal(): number {
    return this.itemsSubject.value.reduce(
      (total, item) => total + (item.precioVenta * item.cantidad || 0),
      0
    );
  }

  contador() {
    return this.itemsSubject.value.length;
  }

  incrementQuantity(productId: number) {
    const currentItems = this.itemsSubject.value;
    const item = currentItems.find((item) => item.id === productId);

    if (item) {
      item.cantidad++;
      this.itemsSubject.next([...currentItems]);
      this.saveCart();
    }
  }

  decrementQuantity(productId: number) {
    const currentItems = this.itemsSubject.value;
    const item = currentItems.find((item) => item.id === productId);

    if (item && item.cantidad > 1) {
      item.cantidad--;
      this.itemsSubject.next([...currentItems]);
      this.saveCart();
    } else {
      this.removeItem(productId);
    }
  }

  removeItem(productId: number) {
    const currentItems = this.itemsSubject.value.filter(
      (item) => item.id !== productId
    );
    this.itemsSubject.next([...currentItems]);
    this.saveCart();
  }

  clearCart() {
    this.itemsSubject.next([]);
    this.saveCart();
  }
}
