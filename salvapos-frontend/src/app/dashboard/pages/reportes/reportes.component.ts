import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarReportesComponent } from '../../components/navbarReportes/navbarReportes.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, NavbarReportesComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReportesComponent {}
