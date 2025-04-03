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
        this.fetchInactiveAssets();
    }

    fetchInactiveAssets(): void {
        this.assetsService.getAssets(1, 100, 'asc', 'AVAILABLE').subscribe({
            next: (response) => {
                if (response?.items && Array.isArray(response.items)) {
                    this.inactiveAssets = response.items.filter(asset => asset.status === 'AVAILABLE');
                } else {
                    this.inactiveAssets = [];
                }
            },
            error: (error) => {
                this.inactiveAssets = [];
            }
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    selectAssets(): void {
        if (!this.assetsList) {
            return;
        }

        const selectedAssets = this.assetsList.selectedOptions.selected.map(option => option.value);
        const selectedAssetIds = selectedAssets.map(asset => asset.id);

        if (selectedAssetIds.length === 0) {
            this.dialogRef.close();
            return; // No assets selected, just close the dialog
        }

        this.dialogRef.close(selectedAssetIds);
    }
}