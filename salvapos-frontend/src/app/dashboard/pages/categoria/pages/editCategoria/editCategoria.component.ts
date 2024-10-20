import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-edit-categoria',
    standalone: true,
    imports: [
        CommonModule,
    ],
    templateUrl: './editCategoria.component.html',
    styleUrl: './editCategoria.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCategoriaComponent { }
