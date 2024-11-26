import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: any[]= [];
  constructor() {
   }
  agregar(producto: any){
    this.items.push(producto);
  }
  getproductos(){
    return this.items; 
  }
  calcularPrecioTotal(): number {
    return this.items.reduce((total, item) => total + (item.precio || 0), 0);
  }
  contador(){
    return this.items.length
  }
  
}
