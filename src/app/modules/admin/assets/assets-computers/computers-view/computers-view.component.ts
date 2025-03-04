import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetsService } from 'app/services/assets/assets.service';
import { ComputerService } from 'app/services/computer/computer.service';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'app/services/alert.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComponentsService } from 'app/services/components/components.service';
import { RepairsService } from 'app/services/repairs/repairs.service';
import { RepairLogs } from 'app/models/RepairLogs/RepairLogs';
import { ModalRemarksUniversalComponent } from '../../components/modal/modal-remarks-universal/modal-remarks-universal.component';
import { ModalPullinComponentComponent } from '../modal-pullin-component/modal-pullin-component.component';
import { ModalPullinAssetsComponent } from '../modal-pullin-assets/modal-pullin-assets.component';

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
        // 'history',
        'action',
    ];
    dataSourceAssignedAssets: any[] = [];
    dataSourceHistory: any[] = [];
    dataSource: any[] = [];
    repairLogs: any;  // Declare the property here
    dataSourceRepairLogs: any[] = []; // Declare data source for repair logs

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
            this.assetsService.getComputersById(id).subscribe({
                next: (data) => {
                    this.asset = data;
    
                    // Initialize the data source
                    this.dataSource = [];
                
                    // Helper function to push an item to the data source
                    const addToDataSource = (name: string, icon: string, items: any) => {
                        if (Array.isArray(items)) {
                            items.forEach(item => {
                                this.dataSource.push({
                                    id: item.id || null,
                                    name,
                                    icon,
                                    description: item.description || 'N/A',
                                    uid: item.uid || 'N/A',
                                    history: item.history || 'N/A',
                                });
                            });
                        } else if (items) {
                            this.dataSource.push({
                                id: items.id || null,
                                name,
                                icon,
                                description: items.description || 'N/A',
                                uid: items.uid || 'N/A',
                                history: items.history || 'N/A',
                            });
                        }
                    };
    
                    // Add RAM (multiple entries)
                    addToDataSource('Ram', 'feather:server', this.asset?.ram?.values?.$values);
    
                    // Add other components (single entries)
                    addToDataSource('SSD', 'feather:hard-drive', this.asset?.ssd?.values?.$values?.[0]);
                    addToDataSource('HDD', 'feather:hard-drive', this.asset?.hdd?.values?.$values?.[0]);
                    addToDataSource('GPU', 'feather:monitor', this.asset?.gpu?.values?.$values?.[0]);
                    addToDataSource('BOARD', 'feather:info', this.asset?.board?.values?.$values?.[0]);
    
                    // Assigned Assets DataSource
                    this.dataSourceAssignedAssets = this.asset?.assigned_assets?.values?.$values?.map(asset => ({
                        name: `${asset.type}`,
                        icon: 'feather:package',
                        description: `${asset.asset_barcode}`,
                        brand: asset.brand,
                        id: asset.id,
                        serial_no: asset.serial_no || 'N/A',
                        action: '',
                    })) || [];
    
                    // History DataSource
                    this.dataSourceHistory = this.asset?.history?.values?.$values?.map((historyItem, index) => ({
                        id: index + 1,
                        name: historyItem?.name ?? 'Unknown', // ✅ Extracts the actual name or defaults to 'Unknown'
                        department: this.asset?.owner?.department || 'N/A',
                        company: this.asset?.owner?.company || 'N/A',
                    })) || [];
    
                    console.log('Data Source History:', this.dataSourceHistory);
    
                    // Fetch repair logs after asset data is loaded
                    this.getHistoryById();
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
            data: { name: 'Are you sure you want to delete this item?' },
        });

        dialogRef.afterClosed().subscribe((result) => {
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
            },
        });
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
    
        // Open the modal to collect remarks
        setTimeout(() => {
            const dialogRef = this.dialog.open(ModalRemarksUniversalComponent, {
                width: '400px',
                data: {
                    id: componentId,
                    title: 'Are you sure you want to pull out this component?' // Custom title
                },
            });
    
            dialogRef.afterClosed().subscribe((result) => {
                console.log('Dialog result:', result);
    
                if (result && result.remark) {  // Ensure we use 'remark', not 'remarks'
                    console.log('User submitted remark:', result.remark);
    
                    // Proceed with API call including remarks
                    this.componentsService
                        .pullOutComponent(componentId, result.remark)  // Use 'remark' here
                        .subscribe({
                            next: (response) => {
                                this.snackBar.open(response.message, 'Close', {
                                    duration: 3000,
                                });
    
                                // 🔄 Refresh the table data
                                this.reloadAssetData();
                            },
                            error: (error) => {
                                this.snackBar.open(
                                    'Error pulling out component',
                                    'Close',
                                    { duration: 3000 }
                                );
                                console.error(error);
                            },
                        });
                } else {
                    console.log('Pull-out canceled or no remark provided.');
                }
            });
        }, 0);
    }
    
    
    

    handleAssetPullOut(assetId: number | null): void {
        console.log('Pull Out button clicked!');
        console.log('Asset ID received:', assetId);
    
        if (!assetId) {
            this.snackBar.open('Invalid asset ID', 'Close', { duration: 3000 });
            return;
        }
    
        // Open modal for remarks input
        const dialogRef = this.dialog.open(ModalRemarksUniversalComponent, {
            width: '400px',         
            data: {
                id: assetId,
                title: 'Are you sure you want to pull out this asset?' // Custom title
            },
        });
    
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('User submitted remark:', result.remark);
    
                // Proceed with API call after getting remark
                this.assetService.pullOutAsset(assetId, result.remark).subscribe({
                    next: (response) => {
                        console.log('Pull out successful:', response);
                        this.snackBar.open(response.message, 'Close', { duration: 3000 });

                        this.reloadAssetData();
                    },
                    error: (error) => {
                        console.error('Pull out failed:', error);
                        this.snackBar.open('Error pulling out asset', 'Close', { duration: 3000 });
                    }
                });
            } else {
                console.log('Pull out cancelled or no remark provided.');
            }
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
     * Confirms before pulling out the asset using a modal
     */
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

    /**
     * Calls the service to pull out an asset
     */
    pullOutAsset(assetId: number): void {
        if (!assetId) {
            this.snackBar.open('Invalid asset ID', 'Close', { duration: 3000 });
            return;
        }
    
        // Open modal to get remarks before proceeding
        const dialogRef = this.dialog.open(ModalRemarksUniversalComponent, {
            width: '400px',
            data: { id: assetId }
        });
    
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.remark) {
                console.log('User submitted remark:', result.remark);
    
                // Proceed with API call after getting remark
                this.assetService.pullOutAsset(assetId, result.remark).subscribe({
                    next: (response) => {
                        this.snackBar.open('Asset successfully pulled out!', 'Close', {
                            duration: 3000,
                        });
                        console.log('Pull-out successful:', response);
    
                        // 🔄 Refresh data after successful pullout
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
                        console.error('Error pulling out asset:', error);
                    }
                });
            } else {
                console.log('Pull out cancelled or no remark provided.');
            }
        });
    }
    

    reloadAssetData(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.assetsService.getComputersById(id).subscribe({
                next: (data) => {
                    this.asset = data;
                    this.updateDataSources();
                    // Also reload repair logs
                    this.getHistoryById();
                },
                error: (err) => console.error('Error fetching asset', err),
            });
        }
    }

    updateDataSources(): void {
        this.dataSource = [
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
            .filter((component) => component.data)
            .map((component) => ({
                id: component.data?.id || null,
                name: component.name,
                icon: component.icon,
                description: component.data?.description || null,
                uid: component.data?.uid || null,
                history: component.data?.history || null,
            }));

        this.dataSourceAssignedAssets =
            this.asset?.assigned_assets?.values?.$values?.map((asset) => ({
                name: `${asset.type}`,
                icon: 'feather:package',
                description: `${asset.asset_barcode}`,
                brand: asset.brand,
                id: asset.id,
                serial_no: asset.serial_no || 'N/A',
                action: '',
            })) || [];

        this.dataSourceHistory =
            this.asset?.history?.values?.$values?.map((historyItem, index) => ({
                id: index + 1,
                name: historyItem?.name || 'Unknown', // ✅ Extracts string or uses a default
                department: this.asset?.owner?.department || 'N/A',
                company: this.asset?.owner?.company || 'N/A',
            })) || [];
    }

    getHistoryById(): void {
        if (this.asset && this.asset.id) {
            console.log('📋 Fetching repair logs for asset ID:', this.asset.id);
    
            this.repairService.getRepairLogsById(this.asset.id).subscribe({
                next: (data: any) => {
                    console.log('✅ Repair Logs Data:', data);
    
                    // Ensure we have a valid response and an array of values
                    this.dataSourceRepairLogs = data?.$values?.map((log: any, index: number) => ({
                        id: index + 1,
                        type: log.type || 'N/A',
                        action: log.action || 'N/A', // ✅ Extracts "action" from log
                        eaf_no: log.eaf_no || 'N/A',
                        computer_id: log.computer_id || 'N/A',
                        item_id: log.item_id?.id || 'N/A',
                        remarks: log.remarks || 'N/A',
                        timestamp: log.timestamp || 'N/A',
                    })) || [];
    
                    console.log('🛠️ Repair Logs Data Source:', this.dataSourceRepairLogs);
                },
                error: (err) => console.error('❌ Error fetching repair logs:', err),
            });
        } else {
            console.warn('⚠️ Asset ID is not available. Current asset:', this.asset);
        }
    }

    //Pull in

    addComponent(): void {
        const dialogRef = this.dialog.open(ModalPullinComponentComponent, {
            width: '600px',
            data: { computerId: this.asset.id } // Pass the computer ID
        });
    
        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
    
            if (result && result.length > 0) {
                // ✅ Call service to pull in each component
                result.forEach(uid => {
                    const requestData = {
                        computer_id: this.asset.id,
                        component_uid: uid,
                        remarks: "Pulled in"
                    };
    
                    this.componentsService.pullInComponent(requestData).subscribe({
                        next: () => {
                            // 🔄 Refresh the table data after success
                            this.reloadAssetData();
    
                            // ✅ Show success message
                            this.snackBar.open('Component successfully pulled in!', 'Close', { 
                                duration: 3000
                            });
                        },
                        error: (error) => {
                            // ❌ Handle errors properly
                            const errorMessage = error?.error?.message || 'Failed to pull in component. Try again.';
                            
                            this.snackBar.open(errorMessage, 'Close', {
                                duration: 3000
                            });
    
                            console.error('Error pulling in component:', error);
                        }
                    });
                });
            }
        });
    }
    
    addPeripherals(): void {
        const dialogRef = this.dialog.open(ModalPullinAssetsComponent, {
            width: '600px',
            data: { computerId: this.asset.id } // Pass the computer ID
        });
    
        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed', result);
    
            if (result && result.length > 0) {
                // ✅ Prepare request data correctly
                const requestData = {
                    computer_id: this.asset.id,
                    asset_ids: result, // Pass the array of selected asset IDs
                    remarks: "Pulled in"
                };
    
                // 🔄 Send a single request with all asset IDs
                this.assetService.pullInAssets(requestData).subscribe({
                    next: () => {
                        // ✅ Refresh the table data after success
                        this.reloadAssetData();
    
                        // ✅ Show success message
                        this.snackBar.open('Assets successfully pulled in!', 'Close', { 
                            duration: 3000
                        });
                    },
                    error: (error) => {
                        // ❌ Handle errors properly
                        const errorMessage = error?.error?.message || 'Failed to pull in assets. Try again.';
                        
                        this.snackBar.open(errorMessage, 'Close', {
                            duration: 3000
                        });
    
                        console.error('Error pulling in assets:', error);
                    }
                });
            }
        });
    }
    
}