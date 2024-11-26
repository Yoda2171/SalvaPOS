import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CartComponent } from '../cart/cart.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  cart = inject(CartService)
  productos: any[] = [
      {name: 'Paracetamol', precio: 2500, id: 1, img: "assets/img/paracetamol.jpg"},
      {name: 'Ibuprofeno', precio: 3000, id: 2, img: "assets/img/ibuprofeno.webp"},
      {name: 'Jarabe', precio: 4500, id: 3, img: "assets/img/jarabe.webp"},
    ];
  agregar(producto: any){
    this.cart.agregar(producto);
  }
    
}
