import { bootstrapApplication } from '@angular/platform-browser';
import { LoginComponent } from './app/login/login.component'; // Asegúrate de que LoginComponent está correctamente importado

bootstrapApplication(LoginComponent)
  .catch(err => console.error(err));
