import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-edit-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editProducto.component.html',
  styleUrl: './editProducto.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditProductoComponent {}
