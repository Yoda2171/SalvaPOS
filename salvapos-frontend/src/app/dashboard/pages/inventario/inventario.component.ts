import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  NavigationEnd,
} from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventarioComponent implements OnInit {
  isAddOrEditProductRoute: boolean = false;
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Escuchar los cambios de la ruta activa
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkCurrentRoute();
      });

    // También ejecutar la lógica cuando se carga inicialmente
    this.checkCurrentRoute();
  }

  // Método para verificar si la ruta actual es addproduct o editproduct
  checkCurrentRoute() {
    const currentRoute = this.route.snapshot.firstChild?.routeConfig?.path;
    // Convertir la expresión en un booleano explícito
    this.isAddOrEditProductRoute =
      currentRoute === 'addproduct' ||
      (currentRoute?.startsWith('editproduct') ?? false);
  }
}
