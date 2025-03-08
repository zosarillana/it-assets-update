import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssetsService } from 'app/services/assets/assets.service';
import { MatSelectionList } from '@angular/material/list';

@Component({
    selector: 'app-modal-pullin-assets',
    templateUrl: './modal-pullin-assets.component.html',
    styleUrls: ['./modal-pullin-assets.component.scss'],
})
export class ModalPullinAssetsComponent implements OnInit {
    @ViewChild('assetsList') assetsList!: MatSelectionList; // ✅ Get reference to mat-selection-list

    inactiveAssets: any[] = [];
    remark: string = ''; // ✅ Store user input for remarks

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
        this.assetsService.getAssets(1, 100, 'asc', 'AVAILABLE').subscribe({
            next: (response) => {
                console.log('Response:', response);
                this.inactiveAssets = response.items.$values.filter(asset => asset.status === 'AVAILABLE');
            },
            error: (error) => {
                console.error('Error fetching available assets:', error);
            }
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    selectAssets(): void {
        if (!this.assetsList) {
            console.error('assetsList is not defined');
            return;
        }

        const selectedAssets = this.assetsList.selectedOptions.selected.map(option => option.value);
        const selectedAssetIds = selectedAssets.map(asset => asset.id);

        console.log('Selected Assets:', selectedAssetIds);

        if (selectedAssetIds.length === 0) {
            this.dialogRef.close();
            return; // No assets selected, just close the dialog
        }

        this.dialogRef.close(selectedAssetIds);
    }
}
