import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetsService } from 'app/services/assets/assets.service';

@Component({
    selector: 'app-edit-inventory',
    templateUrl: './inventory-edit.component.html',
    styleUrls: ['./inventory-edit.component.scss'],
})
export class InventoryEditComponent implements OnInit {
    asset!: Assets;

    constructor(
        private route: ActivatedRoute,
        private assetsService: AssetsService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.assetsService.getAssetById(id).subscribe({
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
