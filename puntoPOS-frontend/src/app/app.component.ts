import { Component, inject} from '@angular/core';
import { HomeComponent } from './component/home/home.component';
import { CommonModule } from '@angular/common';
import { CartComponent } from './component/cart/cart.component';
import { CartService } from './services/cart.service';
import { RouterLink } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { ReturnComponent } from './return/return.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HomeComponent, CartComponent, RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'puntoPOS-frontend';
  cart = inject(CartService)
}
