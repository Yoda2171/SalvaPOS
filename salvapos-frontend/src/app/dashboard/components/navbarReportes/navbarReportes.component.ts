import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar-reportes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbarReportes.component.html',
  styleUrl: './navbarReportes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarReportesComponent {}
