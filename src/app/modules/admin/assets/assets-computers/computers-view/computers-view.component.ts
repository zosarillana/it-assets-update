import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetsService } from 'app/services/assets/assets.service';
import { ComputerService } from 'app/services/computer/computer.service';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'app/services/alert.service';
import { ComponentsService } from 'app/services/components/components.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-computers-view',
    templateUrl: './computers-view.component.html',
    styleUrls: ['./computers-view.component.scss'],
})
export class ComputersViewComponent implements OnInit {
    //  asset!: Assets;
    asset: any;
    displayedColumns: string[] = [
        'component',
        'description',
        'uid',
        'history',
        'action',
    ];
    dataSourceAssignedAssets: any[] = [];
    dataSourceHistory: any[] = [];
    dataSource: any[] = [];
    constructor(
        private route: ActivatedRoute,
        private computerService: ComputerService,
        private dialog: MatDialog,
        private alertService: AlertService,
        private router: Router,
        private componentsService: ComponentsService,
        private snackBar: MatSnackBar,
        private assetService: AssetsService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.computerService.getComputersById(id).subscribe({
                next: (data) => {
                    this.asset = data;
                    this.dataSource = [
                        ...[
                            {
                                name: 'Ram',
                                icon: 'feather:server',
                                data: this.asset?.ram?.values?.$values?.[0],
                            },
                            {
                                name: 'SSD',
                                icon: 'feather:hard-drive',
                                data: this.asset?.ssd?.values?.$values?.[0],
                            },
                            {
                                name: 'HDD',
                                icon: 'feather:hard-drive',
                                data: this.asset?.hdd?.values?.$values?.[0],
                            },
                            {
                                name: 'GPU',
                                icon: 'feather:monitor',
                                data: this.asset?.gpu?.values?.$values?.[0],
                            },
                            {
                                name: 'BOARD',
                                icon: 'feather:info',
                                data: this.asset?.board?.values?.$values?.[0],
                            },
                        ]
                            .filter((component) => component.data) // Remove components with no data
                            .map((component) => ({
                                id: component.data?.id || null,
                                name: component.name,
                                icon: component.icon,
                                description:
                                    component.data?.description || null,
                                uid: component.data?.uid || null,
                                history: component.data?.history || null,
                            })),
                    ];

                    // Assigned Assets DataSource
                    this.dataSourceAssignedAssets =
                        this.asset?.assigned_assets?.values?.$values?.map(
                            (asset) => ({
                                id: asset.id, // ✅ Ensure we correctly assign the ID from the object
                                name: `${asset.type}`,
                                icon: 'feather:package',
                                description: `${asset.asset_barcode}`,
                                brand: asset.brand,
                                serial_no: asset.serial_no || 'N/A',
                                action: '',
                            })
                        ) || [];

                    // History DataSource
                    this.dataSourceHistory =
                        this.asset?.history?.values?.$values?.map(
                            (name, index) => ({
                                id: index + 1,
                                name: name, // The name is the only available data
                                department:
                                    this.asset?.owner?.department || 'N/A',
                                company: this.asset?.owner?.company || 'N/A',
                            })
                        ) || [];
                },
                error: (err) => console.error('Error fetching asset', err),
            });
        }
    }

    handlePullOut(componentId: number | null): void {
        console.log('Pull Out button clicked!');
        console.log('Component ID received:', componentId);

        if (!componentId) {
            this.snackBar.open('Invalid component ID', 'Close', {
                duration: 3000,
            });
            return;
        }

        this.componentsService.pullOutComponent(componentId).subscribe({
            next: (response) => {
                this.snackBar.open(response.message, 'Close', {
                    duration: 3000,
                });
            },
            error: (error) => {
                this.snackBar.open('Error pulling out component', 'Close', {
                    duration: 3000,
                });
                console.error(error);
            },
        });
    }

    handleAssetPullOut(assetId: number | null): void {
        console.log('Pull Out button clicked!');
        console.log('Asset ID received:', assetId);

        if (!assetId) {
            this.snackBar.open('Invalid asset ID', 'Close', { duration: 3000 });
            return;
        }

        console.log(`Making API call: /api/Assets/pullout/${assetId}`);

        this.assetService.pullOutAsset(assetId).subscribe({
            next: (response) => {
                console.log('Pull out successful:', response);
                this.snackBar.open(response.message, 'Close', {
                    duration: 3000,
                });
            },
            error: (error) => {
                console.error('Pull out failed:', error);
                this.snackBar.open('Error pulling out asset', 'Close', {
                    duration: 3000,
                });
            },
        });
    }

    logElement(element: any): void {
        console.log('Full Element Data:', element);
    }

    getComponentId(element: any): number | null {
        console.log('Element received in getComponentId:', element);

        if (element && element.id) {
            console.log('Component ID found:', element.id);
            return element.id;
        } else {
            console.warn('Component ID is missing or null');
            return null;
        }
    }

    getAssetId(asset: any): number | null {
        console.log('Asset received in getAssetId:', asset);

        if (asset && asset.id) {
            console.log('Correct Asset ID found:', asset.id);
            return asset.id;
        } else {
            console.warn('Asset ID is missing or null');
            return null;
        }
    }

    /**
     * Confirms before pulling out the asset
     */
    confirmPullOut(assetId: number): void {
        const confirmDialog = confirm(
            'Are you sure you want to pull out this asset?'
        );

        if (confirmDialog) {
            this.pullOutAsset(assetId);
        }
    }

    /**
     * Calls the service to pull out an asset
     */
    pullOutAsset(assetId: number): void {
        this.assetService.pullOutAsset(assetId).subscribe(
            (response) => {
                this.snackBar.open('Asset successfully pulled out!', 'Close', {
                    duration: 3000,
                });
                console.log('Pull-out successful:', response);
            },
            (error) => {
                this.snackBar.open(
                    'Failed to pull out asset. Try again.',
                    'Close',
                    { duration: 3000 }
                );
                console.error('Error pulling out asset:', error);
            }
        );
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
            data: { name: 'Are you sure you want to delete this item?' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.deleteItem(id);
            }
        });
    }

    private deleteItem(id: string): void {
        this.computerService.deleteEvent(id).subscribe({
            next: () => {
                this.alertService.triggerSuccess('Item deleted successfully!');
                // Redirect to '/assets/components' on success
                this.router.navigate(['/assets/computers']);
            },
            error: (err) => {
                console.error('Error deleting item:', err);
                this.alertService.triggerError('Failed to delete item.');
            },
        });
    }
}
