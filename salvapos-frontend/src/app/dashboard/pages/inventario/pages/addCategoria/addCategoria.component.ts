import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-add-categoria',
    standalone: true,
    imports: [
        CommonModule,
    ],
    templateUrl: './addCategoria.component.html',
    styleUrl: './addCategoria.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCategoriaComponent { }
