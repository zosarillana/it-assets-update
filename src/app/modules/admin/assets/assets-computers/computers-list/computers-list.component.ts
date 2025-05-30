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
import { DepartmentService } from 'app/services/department/department.service';
import { BusinessUnitService } from 'app/services/business-unit/business-unit.service';

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
    departments: any[] = [];
    businessUnits: any[] = [];

    selectedDepartments: any[] = [];
    selectedBusinessUnits: any[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('sidePanel') sidePanel!: SidePanelComputerComponent;

    constructor(
        private assetService: ComputerService,
        private alertService: AlertService,
        private dialog: MatDialog,
        private router: Router,
        private departmentService: DepartmentService,
        private businessUnitService: BusinessUnitService // Assuming this is the correct service for departments
    ) {
        // Initialize the filteredTypeOptions to avoid undefined error
        this.filteredTypeOptions = new Observable<string[]>();
    }

    ngOnInit(): void {
        // Initial data load with fixed page size
        this.isSearchActive = false;
        this.loadAssets(1, this.pageSize);
        this.loadDepartments();
        this.loadBusinessUnits();
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

    isFilterChangeInProgress = false;

   ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;

    this.paginator.page.subscribe((event) => {
        if (this.isFilterChangeInProgress) {
            this.isFilterChangeInProgress = false;
            return;
        }
        this.loadAssets(
            event.pageIndex + 1,
            event.pageSize,
            this.selectedTypeToggle,
            this.selectedDepartments,
            this.selectedBusinessUnits
        );
    });

    this.sort.sortChange.subscribe(() => {
        this.sortOrder = this.sort.direction || 'asc';
        this.isFilterChangeInProgress = true;
        this.paginator.pageIndex = 0;
        this.loadAssets(
            1,
            this.pageSize,
            this.selectedTypeToggle,
            this.selectedDepartments,
            this.selectedBusinessUnits
        );
    });
}

    loadPanel(): void {
        if (!this.sidePanel) {
            console.error('Side panel not found!');
        } else {
            console.log('Opening side panel');

            // Log what is being sent to the panel
            console.log('Sending allTypes to side panel:', this.allTypes);
            console.log(
                'Sending selectedTypeToggle to side panel:',
                this.selectedTypeToggle
            );

            // Optional: If needed to manually update (if not using template binding)
            this.sidePanel.allTypes = this.allTypes;
            this.sidePanel.selectedTypeToggle = [...this.selectedTypeToggle];

            // ✅ Pass departments and business units
            this.sidePanel.departments = this.departments;
            this.sidePanel.businessUnits = this.businessUnits;

            this.sidePanel.openPanel();
        }
    }

   loadAssets(
    pageIndex: number,
    pageSize: number,
    typeFilter?: string[],
    departmentFilter?: any[],
    businessUnitFilter?: any[],
    fetchAll?: boolean
): void {
    this.isLoading = true;

    // Convert to code arrays for the API
    const departmentCodes = departmentFilter?.length
        ? departmentFilter.map((d) => d.code)
        : undefined;
    const businessUnitCodes = businessUnitFilter?.length
        ? businessUnitFilter.map((bu) => bu.code)
        : undefined;

    this.assetService
        .getAssets(
            pageIndex,
            pageSize,
            this.sortOrder,
            this.searchTerm,
            typeFilter,
            departmentCodes,
            businessUnitCodes,
            fetchAll
        )
        .subscribe({
            next: (response: AssetResponse) => {
                this.dataSource.data = response.items || [];
                this.totalItems = response.totalItems || 0;

                // Extract unique types from assets and update allTypes
                const typesSet = new Set<string>();
                (response.items || []).forEach((item) => {
                    if (item.type) {
                        typesSet.add(item.type.toUpperCase());
                    }
                });

                // Always ensure CPU and LAPTOP exist (CPU shown as DESKTOP in UI)
                typesSet.add('CPU');
                typesSet.add('LAPTOP');

                this.allTypes = Array.from(typesSet).sort();

                // Always update paginator length even if there are no items
                if (this.paginator) {
                    this.paginator.length = this.totalItems;
                }

                // Do NOT change pageSize dynamically to totalItems; keep pageSize fixed for paginated navigation

                // Ensure table updates
                this.dataSource._updateChangeSubscription();
                this.isLoading = false;
            },
            error: (error) => {
                this.dataSource.data = [];
                this.totalItems = 0;
                if (this.paginator) {
                    this.paginator.length = 0;
                }
                this.dataSource._updateChangeSubscription();
                this.alertService.triggerError('Failed to load assets.');
                this.isLoading = false;
            },
        });
}
    private loadDepartments(): void {
        this.departmentService.getDepartments().subscribe({
            next: (data) => {
                this.departments = data;
            },
            error: (error) => {
                console.error('Error fetching departments', error);
                this.alertService.triggerError('Failed to load departments.');
            },
        });
    }

    private loadBusinessUnits(): void {
        this.businessUnitService.getDepartments().subscribe({
            next: (data) => {
                this.businessUnits = data;
            },
            error: (error) => {
                console.error('Error fetching business units', error);
                this.alertService.triggerError(
                    'Failed to load business units.'
                );
            },
        });
    }

    // When changing filters (e.g., in your onSidePanelFiltersChanged):
    onSidePanelFiltersChanged(event: {
        types: string[];
        departments: any[];
        businessUnits: any[];
    }) {
        this.selectedTypeToggle = event.types || [];
        this.selectedDepartments = event.departments || [];
        this.selectedBusinessUnits = event.businessUnits || [];
        this.isSearchActive =
            this.selectedTypeToggle.length > 0 ||
            this.selectedDepartments.length > 0 ||
            this.selectedBusinessUnits.length > 0;

        this.isFilterChangeInProgress = true;
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadAssets(
            1,
            this.pageSize,
            this.selectedTypeToggle,
            this.selectedDepartments,
            this.selectedBusinessUnits
        );
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
