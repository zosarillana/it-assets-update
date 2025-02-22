import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetsService } from 'app/services/assets/assets.service';
import { ComputerService } from 'app/services/computer/computer.service';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'app/services/alert.service';

@Component({
    selector: 'app-computers-view',
    templateUrl: './computers-view.component.html',
    styleUrls: ['./computers-view.component.scss'],
})
export class ComputersViewComponent implements OnInit {
    //  asset!: Assets;
    asset: any;
    displayedColumns: string[] = ['component', 'description', 'uid', 'history'];
    dataSourceAssignedAssets: any[] = [];
    dataSourceHistory: any[] = [];    
    dataSource: any[] = [];
    constructor(
        private route: ActivatedRoute,
        private assetsService: ComputerService,
        private dialog: MatDialog,
        private alertService: AlertService,
        private router: Router
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.assetsService.getComputersById(id).subscribe({
                next: (data) => {
                    this.asset = data;
                    this.dataSource = [
                        {
                            name: 'Ram',
                            icon: 'feather:server',
                            description:
                                this.asset?.ram?.values?.$values?.[0]
                                    ?.description || null,
                            uid:
                                this.asset?.ram?.values?.$values?.[0]?.uid ||
                                null,
                            history: this.asset?.ram?.history || null,
                        },
                        {
                            name: 'SSD',
                            icon: 'feather:hard-drive',
                            description:
                                this.asset?.ssd?.values?.$values?.[0]
                                    ?.description || null,
                            uid:
                                this.asset?.ssd?.values?.$values?.[0]?.uid ||
                                null,
                            history: this.asset?.ssd?.history || null,
                        },
                        {
                            name: 'HDD',
                            icon: 'feather:hard-drive',
                            description:
                                this.asset?.hdd?.values?.$values?.[0]
                                    ?.description || null,
                            uid:
                                this.asset?.hdd?.values?.$values?.[0]?.uid ||
                                null,
                            history: this.asset?.hdd?.history || null,
                        },
                        {
                            name: 'GPU',
                            icon: 'feather:monitor',
                            description:
                                this.asset?.gpu?.values?.$values?.[0]
                                    ?.description || null,
                            uid:
                                this.asset?.gpu?.values?.$values?.[0]?.uid ||
                                null,
                            history: this.asset?.gpu?.history || null,
                        },
                    ];
                    // Assigned Assets DataSource
                    this.dataSourceAssignedAssets =
                        this.asset?.assigned_assets?.values?.$values?.map(
                            (asset) => ({
                                name: `${asset.type}`,
                                icon: 'feather:package',
                                description: `${asset.asset_barcode}`,
                                brand: asset.brand,
                                id: asset.id,
                                serial_no: asset.serial_no || 'N/A',
                            })
                        ) || [];

                        // History DataSource
                        this.dataSourceHistory =
                        this.asset?.history?.values?.$values?.map((name, index) => ({
                            id: index + 1,
                            name: name, // The name is the only available data
                            department: this.asset?.owner?.department || "N/A",
                            company: this.asset?.owner?.company || "N/A"
                        })) || [];                                        
                },
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
    getOrdinal(n: number): string {
        if (n > 0) {
          let suffix = ['th owner', 'st owner', 'nd owner', 'rd owner'],
            v = n % 100;
          return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
        }
        return n.toString();
      }
      

       openDeleteDialog(id: string): void {
              const dialogRef = this.dialog.open(ModalUniversalComponent, {
                width: '400px',
                data: { name: 'Are you sure you want to delete this item?' }
              });
              
              dialogRef.afterClosed().subscribe(result => {
                if (result) {
                  this.deleteItem(id);
                }
              });
            }
          
            private deleteItem(id: string): void {
              this.assetsService.deleteEvent(id).subscribe({
                next: () => {
                  this.alertService.triggerSuccess('Item deleted successfully!');
                  // Redirect to '/assets/components' on success
                  this.router.navigate(['/assets/computers']);
                },
                error: (err) => {
                  console.error('Error deleting item:', err);
                  this.alertService.triggerError('Failed to delete item.');
                }
              });
            }
}
