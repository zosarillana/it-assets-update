import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComponentsService } from 'app/services/components/components.service';
import { ModalPullinComponentComponent } from '../modal-pullin-component/modal-pullin-component.component';
import { AssetsService } from 'app/services/assets/assets.service';

@Component({
    selector: 'app-modal-pullin-assets',
    templateUrl: './modal-pullin-assets.component.html',
    styleUrls: ['./modal-pullin-assets.component.scss'],
})
export class ModalPullinAssetsComponent implements OnInit {
    inactiveAssets: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<ModalPullinAssetsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private assetsService: AssetsService
    ) {}

    ngOnInit(): void {
        console.log('Received computer ID:', this.data.computerId);
        this.fetchInactiveAssets();
    }

    fetchInactiveAssets(): void {
        this.assetsService.getAssets(1, 100, 'asc', 'INACTIVE').subscribe({
            next: (response) => {
                console.log('Response:', response); // Log the response to inspect its structure
                this.inactiveAssets = response.items.$values.filter(
                    (asset) => asset.status === 'INACTIVE'
                );
                console.log('Inactive Assets:', this.inactiveAssets);
            },
            error: (error) => {
                console.error('Error fetching inactive assets:', error);
            },
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    selectAssets(selectedAssets: any[]): void {
        const selectedAssetIds = selectedAssets.map(
            (option) => option.value.id
        );
        console.log('Selected Assets:', selectedAssetIds);

        if (selectedAssetIds.length === 0) {
            this.dialogRef.close();
            return; // No assets selected, just close the dialog
        }

        // ✅ Correct API request structure
        const requestData = {
            computer_id: this.data.computerId,
            asset_ids: selectedAssetIds, // Pass array of asset IDs
            remarks: 'Pulled in via modal', // Default remark (customize as needed)
        };

        // 🔄 Send a single request with all asset IDs
        this.assetsService.pullInAssets(requestData).subscribe({
            next: () => {
                console.log('Assets successfully pulled in:', selectedAssetIds);
                this.dialogRef.close(selectedAssetIds); // Close dialog and return selected assets
            },
            error: (error) => {
                console.error('Error pulling in assets:', error);
            },
        });
    }
}
