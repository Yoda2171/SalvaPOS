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
  incrementarCantidad(id: number){
    const item = this.items.find( item => item.id === id);
    if (item.cantidad > 0){
      item.cantidad += 1;
    }
  }
  reducirCantidad(id: number){
    const item = this.items.find( item => item.id === id);
    if (item.cantidad > 1){
      item.cantidad -=1
    }else{
      this.items = this.items.filter(producto => producto.id !== id);
    }
  }
  
}
