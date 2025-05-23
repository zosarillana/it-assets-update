import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetsService } from 'app/services/assets/assets.service';
import { ComputerService } from 'app/services/computer/computer.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'app/services/alert.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComponentsService } from 'app/services/components/components.service';
import { RepairsService } from 'app/services/repairs/repairs.service';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';
import { ModalRemarksUniversalComponent } from '../../components/modal/modal-remarks-universal/modal-remarks-universal.component';
import { ModalPullinComponentComponent } from '../modal-pullin-component/modal-pullin-component.component';
import { ModalPullinAssetsComponent } from '../modal-pullin-assets/modal-pullin-assets.component';

@Component({
    selector: 'app-computers-view',
    templateUrl: './computers-view.component.html',
    styleUrls: ['./computers-view.component.scss'],
})
export class ComputersViewComponent implements OnInit {
    asset: any;
    displayedColumns: string[] = ['component', 'uid', 'description', 'action'];
    dataSourceAssignedAssets: any[] = [];
    dataSourceHistory: any[] = [];
    dataSource: any[] = [];
    repairLogs: any;
    dataSourceRepairLogs: any[] = [];
    hasLaptop: boolean = true;
    loading: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private assetService: AssetsService,
        private componentsService: ComponentsService,
        private assetsService: ComputerService,
        private repairService: RepairsService,
        private dialog: MatDialog,
        private alertService: AlertService,
        private snackBar: MatSnackBar,
        private router: Router
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.loading = true;
            this.assetsService.getComputersById(id).subscribe({
                next: (data) => {
                    this.asset = data;
                    this.updateDataSources();
                    this.getHistoryById();
                    this.loading = false;
                },
                error: (err) => {
                    this.loading = false;
                },
            });
        }
    }

    updateDataSources(): void {
        this.dataSource = [];
        // Helper function to push an item to the data source
        const addToDataSource = (name: string, icon: string, items: any) => {
            if (Array.isArray(items)) {
                items.forEach((item) => {
                    this.dataSource.push({
                        id: item.id || null,
                        name,
                        icon,
                        description: item.description || '-',
                        uid: item.uid || '-',
                        history: item.history || '-',
                    });
                });
            } else if (items) {
                this.dataSource.push({
                    id: items.id || null,
                    name,
                    icon,
                    description: items.description || '-',
                    uid: items.uid || '-',
                    history: items.history || '-',
                });
            }
        };
        // Add components to dataSource
        addToDataSource('Ram', 'feather:server', this.asset?.ram?.values);
        addToDataSource('SSD', 'feather:hard-drive', this.asset?.ssd?.values);
        addToDataSource('HDD', 'feather:hard-drive', this.asset?.hdd?.values);
        addToDataSource('GPU', 'feather:monitor', this.asset?.gpu?.values);
        addToDataSource('BOARD', 'feather:info', this.asset?.board?.values);
        addToDataSource('PSU', 'feather:power', this.asset?.psu?.values);
        addToDataSource('CPU', 'feather:cpu', this.asset?.cpu?.values);
        addToDataSource('CPU FAN', 'feather:cpu', this.asset?.cpu_fan?.values);
        addToDataSource('CD ROM', 'feather:disc', this.asset?.cd_rom?.values);
        addToDataSource(
            'BATTERY',
            'feather:battery',
            this.asset?.battery?.values
        );

        // Create assigned assets data source
        this.dataSourceAssignedAssets =
            this.asset?.assigned_assets?.values?.map((asset) => ({
                name: `${asset.type}`,
                icon: 'feather:package',
                uid: `${asset.asset_barcode}`,
                model: asset.model || '-',
                brand: asset.brand,
                id: asset.id,
                serial_no: asset.serial_no || '-',
                action: '',
            })) || [];

        console.log('Asset:', this.asset);
        console.log('History:', this.asset?.history);
        console.log('History Values:', this.asset?.history?.values);

        // Create history data source
        this.dataSourceHistory =
            this.asset?.history?.values?.map((historyItem, index) => ({
                id: index + 1,
                name: historyItem?.name ?? 'Unknown',
                department: historyItem?.department || '-',
                company: historyItem?.company || '-',
            })) || [];
    }

    reloadAssetData(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.assetsService.getComputersById(id).subscribe({
                next: (data) => {
                    this.asset = data;
                    this.updateDataSources();
                    this.getHistoryById();
                },
                error: (err) => console.error('Error fetching asset', err),
            });
        }
    }

    getHistoryById(): void {
        if (this.asset && this.asset.id) {
            this.repairService.getRepairLogsById(this.asset.id).subscribe({
                next: (data: any) => {
                    this.dataSourceRepairLogs =
                        data.map((log: any) => ({
                            inventory_code: log.inventory_code || '-',
                            id: log.id || '-',
                            type: log.type || '-',
                            action: log.action || '-',
                            eaf_no: log.eaf_no || '-',
                            computer_id: log.computer_id || '-',
                            item_id: log.item_id.id || '-',
                            remarks: log.remarks || '-',
                            timestamp: log.timestamp || '-',
                        })) || [];
                },
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
            data: { name: 'Are you sure you want to delete this item?' },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.deleteItem(id);
            }
        });
    }

    deleteItem(id: string): void {
        this.assetsService.deleteEvent(id).subscribe({
            next: () => {
                this.alertService.triggerSuccess('Item deleted successfully!');
                this.router.navigate(['/assets/computers']);
            },
            error: (err) => {
                this.alertService.triggerError('Failed to delete item.');
            },
        });
    }

    handlePullOut(componentId: number | null): void {
        if (!componentId) {
            this.snackBar.open('Invalid component ID', 'Close', {
                duration: 3000,
            });
            return;
        }
        setTimeout(() => {
            const dialogRef = this.dialog.open(ModalRemarksUniversalComponent, {
                width: '400px',
                data: {
                    id: componentId,
                    title: 'Are you sure you want to pull out this component?',
                },
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result && result.remarks) {
                    this.componentsService
                        .pullOutComponent(
                            componentId,
                            result.remarks,
                            result.is_defective
                        )
                        .subscribe({
                            next: (response) => {
                                this.snackBar.open(response.message, 'Close', {
                                    duration: 3000,
                                });
                                this.reloadAssetData();
                            },
                            error: () => {
                                this.snackBar.open(
                                    'Error pulling out component',
                                    'Close',
                                    { duration: 3000 }
                                );
                            },
                        });
                }
            });
        }, 0);
    }

    handleAssetPullOut(assetId: number | null): void {
        if (!assetId) {
            this.snackBar.open('Invalid asset ID', 'Close', { duration: 3000 });
            return;
        }
        const dialogRef = this.dialog.open(ModalRemarksUniversalComponent, {
            width: '400px',
            data: {
                id: assetId,
                title: 'Are you sure you want to pull out this asset?',
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.remarks) {
                this.assetService
                    .pullOutAsset(assetId, result.remarks, result.is_defective)
                    .subscribe({
                        next: (response) => {
                            this.snackBar.open(response.message, 'Close', {
                                duration: 3000,
                            });
                            this.reloadAssetData();
                        },
                        error: () => {
                            this.snackBar.open(
                                'Error pulling out asset',
                                'Close',
                                { duration: 3000 }
                            );
                        },
                    });
            }
        });
    }

    logElement(element: any): void {}

    getComponentId(element: any): number | null {
        if (element && element.id) {
            return element.id;
        } else {
            return null;
        }
    }

    getAssetId(asset: any): number | null {
        if (asset && asset.id) {
            return asset.id;
        } else {
            return null;
        }
    }

    confirmPullOut(assetId: number): void {
        const dialogRef = this.dialog.open(ModalUniversalComponent, {
            width: '400px',
            data: { name: 'Are you sure you want to pull out this asset?' },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.pullOutAsset(assetId);
            }
        });
    }

    pullOutAsset(assetId: number): void {
        if (!assetId) {
            this.snackBar.open('Invalid asset ID', 'Close', { duration: 3000 });
            return;
        }
        const dialogRef = this.dialog.open(ModalRemarksUniversalComponent, {
            width: '400px',
            data: { id: assetId },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.remark) {
                this.assetService
                    .pullOutAsset(assetId, result.remarks, result.is_defective)
                    .subscribe({
                        next: (response) => {
                            this.snackBar.open(
                                'Asset successfully pulled out!',
                                'Close',
                                {
                                    duration: 3000,
                                }
                            );
                            this.reloadAssetData();
                        },
                        error: (error) => {
                            this.snackBar.open(
                                'Failed to pull out asset. Try again.',
                                'Close',
                                {
                                    duration: 3000,
                                }
                            );
                        },
                    });
            }
        });
    }

    addComponent(): void {
        const dialogRef = this.dialog.open(ModalPullinComponentComponent, {
            width: '600px',
            data: { computerId: this.asset.id },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.length > 0) {
                result.forEach((uid) => {
                    const requestData = {
                        computer_id: this.asset.id,
                        component_uid: uid,
                        remarks: 'Pulled in',
                    };
                    this.componentsService
                        .pullInComponent(requestData)
                        .subscribe({
                            next: () => {
                                this.reloadAssetData();
                                this.snackBar.open(
                                    'Component successfully pulled in!',
                                    'Close',
                                    {
                                        duration: 3000,
                                    }
                                );
                            },
                            error: (error) => {
                                const errorMessage =
                                    error?.error?.message ||
                                    'Failed to pull in component. Try again.';
                                this.snackBar.open(errorMessage, 'Close', {
                                    duration: 3000,
                                });
                            },
                        });
                });
            }
        });
    }

    addPeripherals(): void {
        const dialogRef = this.dialog.open(ModalPullinAssetsComponent, {
            width: '600px',
            data: { computerId: this.asset.id },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.length > 0) {
                const requestData = {
                    computer_id: this.asset.id,
                    asset_ids: result,
                    remarks: 'Pulled in',
                };
                this.assetService.pullInAssets(requestData).subscribe({
                    next: () => {
                        this.reloadAssetData();
                        this.snackBar.open(
                            'Assets successfully pulled in!',
                            'Close',
                            {
                                duration: 3000,
                            }
                        );
                    },
                    error: (error) => {
                        const errorMessage =
                            error?.error?.message ||
                            'Failed to pull in assets. Try again.';
                        this.snackBar.open(errorMessage, 'Close', {
                            duration: 3000,
                        });
                    },
                });
            }
        });
    }
}
