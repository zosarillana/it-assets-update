import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { ComponentsService } from 'app/services/components/components.service';
import { ComputerService } from 'app/services/computer/computer.service';

@Component({
    selector: 'app-components-view',
    templateUrl: './components-view.component.html',
    styleUrls: ['./components-view.component.scss'],
})
export class ComponentsViewComponent implements OnInit {
    asset!: Assets;

    constructor(
        private route: ActivatedRoute,
        private assetsService: ComponentsService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.assetsService.getComponentsById(id).subscribe({
                next: (data) => (this.asset = data),
                error: (err) => console.error('Error fetching asset', err),
            });
        }
    }
    previewSelectedImage(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = (e: ProgressEvent<FileReader>) => {
                const previewImage = document.getElementById(
                    'preview-image'
                ) as HTMLImageElement;
                if (previewImage) {
                    previewImage.src = e.target?.result as string;
                }
            };

            reader.readAsDataURL(file);
        }
    }
}
