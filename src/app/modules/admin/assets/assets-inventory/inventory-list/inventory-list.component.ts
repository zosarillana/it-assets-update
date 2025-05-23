import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AssetsService } from 'app/services/assets/assets.service';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';
import { AlertService } from 'app/services/alert.service';
import { SidePanelComputerComponent } from '../../assets-computers/computers-list/side-panel-computer/side-panel-computer.component';

@Component({
    selector: 'app-inventory-list',
    templateUrl: './inventory-list.component.html',
    styleUrls: ['./inventory-list.component.scss'],
})
export class InventoryListComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        // 'asset_img',
        'asset_barcode',
        'type',
        // 'pc_type',
        // 'brand',
        // 'serial_no',
        'model',
        'date_acquired',
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
        private assetService: AssetsService,
        private dialog: MatDialog,
        private alertService: AlertService
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

    loadPanel(): void {
        this.sidePanel.openPanel();
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

        this.loadAssets(1, this.pageSize);
    }

    filterTypes(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.allTypes.filter((type) =>
            type.toLowerCase().includes(filterValue)
        );
    }

    // New method to handle selection from autocomplete
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

    // In inventory-list.component.ts
    isValidDate(date: any): boolean {
        if (!date) return false; // catches null, undefined, ''
        const parsedDate = new Date(date);
        return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
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
                setTimeout(() => {
                    window.location.reload();
                }, 1000); // Small delay for the alert to be visible
            },
            error: (err) => {
                console.error('Error deleting item:', err);
                this.alertService.triggerError('Failed to delete item.');
            },
        });
    }
}
