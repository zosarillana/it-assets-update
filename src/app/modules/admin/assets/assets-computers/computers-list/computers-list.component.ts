import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ComputerService } from 'app/services/computer/computer.service';
import { AlertService } from 'app/services/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';
import { ModalRemarksUniversalComponent } from '../../components/modal/modal-remarks-universal/modal-remarks-universal.component';
import { SidePanelComputerComponent } from './side-panel-computer/side-panel-computer.component';

@Component({
    selector: 'app-computers-list',
    templateUrl: './computers-list.component.html',
    styleUrls: ['./computers-list.component.scss'],
})
export class ComputersListComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'asset_barcode',
        'type',
        'brand',
        'model',
        // 'serial_no',
        'active_user',
        'bu',
        'status',
        'action',
    ];

    dataSource = new MatTableDataSource<Assets>();
    pageSize = 10;
    sortOrder = 'asc';
    searchTerm = '';
    totalItems = 0;
    pageSizeOptions = [5, 10, 25, 50];
    isLoading = false;
    selectedTypeToggle: string[] = [];

    // Auto-complete
    typeFilterControl = new FormControl('');
    filteredTypeOptions: Observable<string[]>;
    allTypes: string[] = []; // Store unique type values

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('sidePanel') sidePanel!: SidePanelComputerComponent;
    constructor(
        private assetService: ComputerService,
        private alertService: AlertService,
        private dialog: MatDialog,
        private router: Router
    ) {}

    ngOnInit(): void {
        // console.log(this.dataSource.data);
        this.loadAssets(1, this.pageSize);

        // Set up the autocomplete filter
        this.filteredTypeOptions = this.typeFilterControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterTypes(value))
        );

        // Subscribe to valueChanges to dynamically filter the table
        this.typeFilterControl.valueChanges.subscribe((value) => {
            this.applyTypeFilter(value);
        });
    }

    loadPanel(): void {
        this.sidePanel.openPanel();
    }    

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.allTypes.filter((option) =>
            option.toLowerCase().includes(filterValue)
        );
    }

    loadAllTypes(): void {
        this.assetService.getAllTypes().subscribe({
            next: (types: string[]) => {
                this.allTypes = types;
            },
            error: (error) => {
                console.error('Error fetching types:', error);
            },
        });
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe((event) => {
            this.loadAssets(event.pageIndex + 1, event.pageSize);
        });

        this.sort.sortChange.subscribe(() => {
            this.sortOrder = this.sort.direction;
            this.paginator.pageIndex = 0;
            this.loadAssets(1, this.pageSize);
        });
    }

    loadAssets(
        pageIndex: number,
        pageSize: number,
        typeFilter?: string[],
        fetchAll?: boolean
    ): void {
        this.isLoading = true;

        this.assetService
            .getAssets(
                pageIndex,
                pageSize,
                this.sortOrder,
                this.searchTerm,
                typeFilter,
                fetchAll
            )
            .subscribe({
                next: (response: AssetResponse) => {
                    // console.log('API Response:', response);

                    // Extract $values safely
                    this.dataSource.data =
                        (response.items as any)?.$values ??
                        (response.items as Assets[]);

                    // Update total items for paginator
                    this.totalItems = response.totalItems;
                    this.paginator.length = this.totalItems;

                    // Extract unique types from the assets
                    this.allTypes = [
                        ...new Set(
                            this.dataSource.data.map((asset) => asset.type)
                        ),
                    ];

                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error fetching assets:', error);
                    this.isLoading = false;
                },
            });
    }

    onSearch(): void {
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadAssets(1, this.pageSize);
    }

    announceSortChange(event: any): void {
        this.sortOrder = event.direction;
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadAssets(1, this.pageSize);
    }

    resetDataSource(): void {
        this.dataSource.data = [];
        this.totalItems = 0;
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadAssets(1, this.pageSize);
    }

    applyTypeFilter(searchValue: string): void {
        this.searchTerm = searchValue.trim().toLowerCase();

        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }

        // Optional: You could add client-side filtering as a fallback
        this.dataSource.filter = this.searchTerm;

        // Keep your server-side pagination/filtering
        this.loadAssets(1, this.pageSize);
    }

    filterTypes(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.allTypes.filter((type) =>
            type.toLowerCase().includes(filterValue)
        );
    }

    onTypeSelected(selectedTypes?: string[]): void {
        if (selectedTypes) {
            this.selectedTypeToggle = selectedTypes;
        }

        this.dataSource.filterPredicate = (data: Assets) => {
            if (!this.selectedTypeToggle.length) {
                return true;
            }
            return this.selectedTypeToggle.includes(data.type);
        };

        this.dataSource.filter = JSON.stringify(this.selectedTypeToggle);
        this.loadAssets(1, this.pageSize, this.selectedTypeToggle, true);
    }

    isValidDate(date: any): boolean {
        return date && !isNaN(new Date(date).getTime());
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
        this.assetService.deleteEvent(id).subscribe({
            next: () => {
                this.alertService.triggerSuccess('Item deleted successfully!');
                // Reload the page after successful deletion
                this.router.navigate(['/assets/computers']).then(() => {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000); // Small delay for the alert to be visible
                });
            },
            error: (err) => {
                console.error('Error deleting item:', err);
                this.alertService.triggerError('Failed to delete item.');
            },
        });
    }

    // Method to open the remarks modal
    openRemarkModal(id: number): void {
        const dialogRef = this.dialog.open(ModalRemarksUniversalComponent, {
            width: '400px',
            data: { id, title: 'Set remark for computer' }, // Pass the ID to the modal
        });

        // Handle the modal result after it's closed
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                // console.log('Remark Submitted:', result);
                this.submitRemark(result.id, result.remark); // Handle the submission logic here
            }
        });
    }

    // Method to submit the remark to the API
    submitRemark(id: number, remark: string): void {
        // Ensure the remark is not null, undefined, or empty (even after trimming)
        const trimmedRemark = (remark || '').trim();

        if (trimmedRemark.length > 0) {
            const updatedAsset = {
                asset_id: id.toString(),
                updated_by: 'Admin',
                remarks: trimmedRemark,
                department: '',
                type: '',
                date_updated: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                asset_barcode: '',
                brand: '',
                model: '',
                ram: '',
                hdd: '',
                ssd: '',
                gpu: '',
                motherboard: '',
                size: '',
                color: '',
                serial_no: '',
                po: '',
                warranty: '',
                cost: 0,
                history: [
                    'Asset remarks updated on ' +
                        new Date().toISOString().split('T')[0],
                ],
                li_description: '',
                company: '',
                user_name: '',
                date_acquired: '',
            };

            //   console.log('Submitting remark:', updatedAsset);

            // Call the API to update the asset
            this.assetService.putEvent(id.toString(), updatedAsset).subscribe({
                next: (response) => {
                    //   console.log('Remark successfully submitted:', response);
                    this.alertService.triggerSuccess(
                        'Remark submitted successfully!'
                    );
                },
                error: (err) => {
                    //   console.error('Error submitting remark:', err);
                    this.alertService.triggerError('Failed to submit remark.');
                },
            });
        } else {
            //   console.log('Remark cannot be empty.');
            this.alertService.triggerError('Remark cannot be empty.');
        }
    }
}
