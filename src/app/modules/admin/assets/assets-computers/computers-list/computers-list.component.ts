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
    pageSizeOptions = [10, 15, 20, 50, 100];
    dynamicPageSize = 10; // This will be bound to the template
    isLoading = false;
    selectedTypeToggle: string[] = [];
    isSearchActive = false; // Flag to track if user has performed a search

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
    ) {
        // Initialize the filteredTypeOptions to avoid undefined error
        this.filteredTypeOptions = new Observable<string[]>();
    }

    ngOnInit(): void {
        // Load all types for the filter
        // this.loadAllTypes();

        // Initial data load with fixed page size
        this.isSearchActive = false;
        this.loadAssets(1, this.pageSize);

        // Set up the autocomplete filter
        this.filteredTypeOptions = this.typeFilterControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterTypes(value || ''))
        );

        // Subscribe to valueChanges to dynamically filter the table
        this.typeFilterControl.valueChanges.subscribe((value) => {
            this.applyTypeFilter(value || '');
        });
    }

    ngAfterViewInit(): void {
        // Connect the data source to the paginator and sort
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        // Listen for paginator events
        this.paginator.page.subscribe((event) => {
            this.loadAssets(event.pageIndex + 1, event.pageSize);
        });

        // Listen for sort events
        this.sort.sortChange.subscribe(() => {
            this.sortOrder = this.sort.direction || 'asc';
            this.paginator.pageIndex = 0;
            this.loadAssets(1, this.pageSize);
        });
    }

    loadPanel(): void {
        this.sidePanel.openPanel();
    }

    //    loadAllTypes(): void {
    //         this.assetService.getAllTypes().subscribe({
    //             next: (types: string[]) => {
    //                 this.allTypes = types;
    //             },
    //             error: (error) => {
    //                 console.error('Error fetching types:', error);
    //             },
    //         });
    //     }

    loadAssets(
        pageIndex: number,
        pageSize: number,
        typeFilter?: string[],
        fetchAll?: boolean
    ): void {
        this.isLoading = true;

        // If this is a new search or filter, we want to use the dynamic page size
        const effectivePageSize =
            pageIndex === 1 && !fetchAll ? this.dynamicPageSize : pageSize;

        this.assetService
            .getAssets(
                pageIndex,
                effectivePageSize,
                this.sortOrder,
                this.searchTerm,
                typeFilter,
                fetchAll
            )
            .subscribe({
                next: (response: AssetResponse) => {
                    // console.log('API Response:', response);

                    // Clear the data source before adding new data
                    this.dataSource.data = [];

                    // Ensure we have items before assigning them
                    if (response.items && response.items.length > 0) {
                        // Assign the data to the data source
                        this.dataSource.data = response.items;
                        // console.log('Data Source after assignment:', this.dataSource.data);

                        // Update total items for paginator
                        this.totalItems = response.totalItems || 0;

                        // Dynamically adjust page size only if search or filter is active
                        if (
                            this.totalItems > this.pageSize &&
                            this.totalItems <= 100 &&
                            this.isSearchActive
                        ) {
                            // Add total items to pageSizeOptions if it's not already there
                            if (
                                !this.pageSizeOptions.includes(this.totalItems)
                            ) {
                                // Find the right position to insert the new option to keep the array sorted
                                let insertIndex =
                                    this.pageSizeOptions.findIndex(
                                        (size) => size > this.totalItems
                                    );
                                if (insertIndex === -1) {
                                    // If all existing options are smaller, add to the end
                                    this.pageSizeOptions.push(this.totalItems);
                                } else {
                                    // Insert at the correct position
                                    this.pageSizeOptions.splice(
                                        insertIndex,
                                        0,
                                        this.totalItems
                                    );
                                }
                            }

                            // Update the page size properties
                            this.pageSize = this.totalItems;
                            this.dynamicPageSize = this.totalItems;

                            // Update the paginator
                            if (this.paginator) {
                                this.paginator.pageSize = this.totalItems;
                                this.paginator.pageIndex = 0;

                                // Force the paginator to redraw with the new values
                                setTimeout(() => {
                                    if (this.paginator) {
                                        this.paginator._changePageSize(
                                            this.totalItems
                                        );
                                    }
                                });
                            }
                        } else if (!this.isSearchActive) {
                            // Keep standard pagination for initial load
                            this.dynamicPageSize = 10;
                            this.pageSize = 10;

                            if (
                                this.paginator &&
                                this.paginator.pageSize !== 10
                            ) {
                                this.paginator.pageSize = 10;
                                setTimeout(() => {
                                    if (this.paginator) {
                                        this.paginator._changePageSize(10);
                                    }
                                });
                            }
                        }
                    }

                    // Trigger change detection
                    this.dataSource._updateChangeSubscription();

                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error fetching assets:', error);
                    this.alertService.triggerError('Failed to load assets.');
                    this.isLoading = false;
                },
            });
    }

    onSearch(): void {
        // Set search mode based on whether there's actually a search term
        this.isSearchActive = this.searchTerm.trim().length > 0;

        if (this.paginator) {
            this.paginator.pageIndex = 0;

            // If search is empty, reset to standard pagination
            if (!this.isSearchActive) {
                this.dynamicPageSize = 10;
                this.pageSize = 10;
                this.paginator.pageSize = 10;
            }
        }

        this.loadAssets(1, this.pageSize);
    }

    announceSortChange(event: any): void {
        this.sortOrder = event.direction || 'asc';
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadAssets(1, this.pageSize);
    }

    resetDataSource(): void {
        this.searchTerm = '';
        this.typeFilterControl.setValue('');
        this.selectedTypeToggle = [];
        this.dataSource.data = [];
        this.totalItems = 0;
        this.pageSize = 10; // Reset to default page size
        this.dynamicPageSize = 10; // Reset dynamic page size too
        this.isSearchActive = false; // Reset search mode
        if (this.paginator) {
            this.paginator.pageIndex = 0;
            this.paginator.pageSize = 10; // Reset paginator page size too
        }
        this.loadAssets(1, this.pageSize);
    }

    applyTypeFilter(searchValue: string): void {
        this.searchTerm = searchValue.trim().toLowerCase();

        // Set search mode based on whether there's actually a search term
        this.isSearchActive = this.searchTerm.length > 0;

        if (this.paginator) {
            this.paginator.pageIndex = 0;

            // If search is empty, reset to standard pagination
            if (!this.isSearchActive) {
                this.dynamicPageSize = 10;
                this.pageSize = 10;
                this.paginator.pageSize = 10;
            }
        }

        // We're using server-side filtering, so we need to reload the data instead of filtering the dataSource directly
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
            // Set search mode based on whether there are any selected types
            this.isSearchActive = selectedTypes.length > 0;
        } else {
            this.isSearchActive = false;
        }

        if (this.paginator) {
            this.paginator.pageIndex = 0;

            // If no type filters selected, reset to standard pagination
            if (!this.isSearchActive) {
                this.dynamicPageSize = 10;
                this.pageSize = 10;
                this.paginator.pageSize = 10;
            }
        }

        // Load assets with the selected type filter
        this.loadAssets(1, this.pageSize, this.selectedTypeToggle);
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
                // Reload the current page instead of refreshing the whole page
                this.loadAssets(this.paginator.pageIndex + 1, this.pageSize);
            },
            error: (err) => {
                console.error('Error deleting item:', err);
                this.alertService.triggerError('Failed to delete item.');
            },
        });
    }

    openRemarkModal(id: number): void {
        const dialogRef = this.dialog.open(ModalRemarksUniversalComponent, {
            width: '400px',
            data: { id, title: 'Set remark for computer' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.submitRemark(result.id, result.remark);
            }
        });
    }

    submitRemark(id: number, remark: string): void {
        const trimmedRemark = (remark || '').trim();

        if (trimmedRemark.length > 0) {
            const updatedAsset = {
                asset_id: id.toString(),
                updated_by: 'Admin',
                remarks: trimmedRemark,
                department: '',
                type: '',
                date_updated: new Date().toISOString().split('T')[0],
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

            this.assetService.putEvent(id.toString(), updatedAsset).subscribe({
                next: () => {
                    this.alertService.triggerSuccess(
                        'Remark submitted successfully!'
                    );
                    // Reload the current page to reflect changes
                    this.loadAssets(
                        this.paginator.pageIndex + 1,
                        this.pageSize
                    );
                },
                error: (err) => {
                    console.error('Error submitting remark:', err);
                    this.alertService.triggerError('Failed to submit remark.');
                },
            });
        } else {
            this.alertService.triggerError('Remark cannot be empty.');
        }
    }
}
