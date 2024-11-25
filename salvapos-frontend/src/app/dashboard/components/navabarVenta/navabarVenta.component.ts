import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navabar-venta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navabarVenta.component.html',
  styleUrls: ['./navabarVenta.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavabarVentaComponent implements OnInit {
  userRole: string | null = null;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.userRole = currentUser ? currentUser.role : null;
  }
}
