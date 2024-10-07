import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import HomeComponent from './dashboard/dashboard.component';
import LoginComponent from './dashboard/pages/auth/login/login.component';
import RegisterComponent from './dashboard/pages/auth/register/register.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomeComponent, LoginComponent, RegisterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'SalvaPos';
}
