import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AssetsService } from '../../../../../services/assets/assets.service';

@Component({
  selector: 'app-computer-pull-in-assets-modal',
  templateUrl: './computer-pull-in-assets-modal.component.html',
  styleUrls: ['./computer-pull-in-assets-modal.component.scss']
})
export class ComputerPullInAssetsModalComponent implements OnInit {
  inactiveAssets: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ComputerPullInAssetsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private assetsService: AssetsService
  ) { }

  ngOnInit(): void {
    console.log('Received computer ID:', this.data.computerId);
    this.fetchInactiveAssets();
  }

  fetchInactiveAssets(): void {
    this.assetsService.getAssets(1, 100, 'asc', 'INACTIVE').subscribe({
      next: (response) => {
        console.log('Response:', response); // Log the response to inspect its structure
        this.inactiveAssets = response.items.$values.filter(asset => asset.status === 'INACTIVE');
        console.log('Inactive Assets:', this.inactiveAssets);
      },
      error: (error) => {
        console.error('Error fetching inactive assets:', error);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  selectAssets(selectedAssets: any[]): void {
    const selectedAssetIds = selectedAssets.map(option => option.value.id);
    console.log('Selected Assets:', selectedAssetIds);

    this.assetsService.pullInAssets(this.data.computerId, selectedAssetIds).subscribe({
        next: response => {
            console.log('Batch response:', response);
        },
        error: error => {
            console.error('Error pulling in assets:', error);
        }
    });

    this.dialogRef.close(selectedAssetIds);
}

}