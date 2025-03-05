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
      this.assetsService.getAssets(1, 100, 'asc', 'INACTIVE').subscribe({
          next: (response) => {
              console.log('Response:', response);
              this.inactiveAssets = response.items.$values.filter(asset => asset.status === 'INACTIVE');
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

    if (selectedAssetIds.length === 0) {
        this.dialogRef.close();
        return; // No assets selected, just close the dialog
    }

    // ❌ Remove API call here
    this.dialogRef.close(selectedAssetIds); // ✅ Only close and send selected IDs
}

}