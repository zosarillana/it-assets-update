import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AccountabilityService } from 'app/services/accountability/accountability.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';
import { AlertService } from 'app/services/alert.service';

// Define an interface for your accountability item
interface AccountabilityItem {
    accountability_code: string;
    tracking_code: string;
    computer: string;
    assets: string;
    owner: string;
    department: string;
    status: string;
}

@Component({
    selector: 'app-accountability-list',
    templateUrl: './accountability-list.component.html',
    styleUrls: ['./accountability-list.component.scss'],
})
export class AccountabilityListComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        'accountability_code',
        'tracking_code',
        'computer',
        'assets',
        'owner',
        'department',
        'status',
        'action'
    ];

    data: AccountabilityItem[] = [];
    dataSource = new MatTableDataSource<AccountabilityItem>([]);
    
    // Explicitly type allTypes as string[]
    allTypes: string[] = []; 
    typeFilterControl = new FormControl('');
    filteredTypeOptions: Observable<string[]>;

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(
        private _service: AccountabilityService, 
        private alertService: AlertService, 
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.loadAccountabilityData();

        // Set up filtering for autocomplete
        this.filteredTypeOptions = this.typeFilterControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || ''))
        );

        // Listen for changes and apply filter dynamically
        this.typeFilterControl.valueChanges.subscribe((value) => {
            this.applyFilter(value);
        });
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    // Updated to use the new interface and handle potential undefined values
    loadAccountabilityData(): void {
        this._service.getAllAccountability().subscribe({
            next: (response: any) => {
                if (response && response.$values) {
                    // Type assertion to ensure type safety
                    this.data = response.$values as AccountabilityItem[];
                    this.dataSource.data = this.data;

                    // Extract unique accountability codes safely
                    this.allTypes = this.data
                        .map(item => item.accountability_code)
                        .filter(code => code != null); // Filter out any null/undefined values

                    // Ensure paginator works after data loads
                    setTimeout(() => {
                        if (this.paginator) {
                            this.dataSource.paginator = this.paginator;
                        }
                    });
                }
            },
            error: (error) => {
                console.error('Error fetching accountability data', error);
                this.alertService.triggerError('Failed to load accountability data');
            }
        });
    }

    // Explicitly type the filter method
    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.allTypes.filter((option) =>
            option.toLowerCase().includes(filterValue)
        );
    }

    // Apply filter when a type is selected
    onTypeSelected(selectedType?: string): void {
        if (!selectedType) {
            this.dataSource.data = this.data; // Reset data if empty
            return;
        }

        this.dataSource.data = this.data.filter((item) =>
            item.accountability_code.toLowerCase().includes(selectedType.toLowerCase())
        );

        if (this.paginator) {
            this.paginator.firstPage(); // Reset pagination on filter
        }
    }

    // General filter application method
    applyFilter(value: string): void {
        if (!value) {
            this.dataSource.data = this.data; // Reset to all data
        } else {
            this.dataSource.data = this.data.filter((item) =>
                item.accountability_code.toLowerCase().includes(value.toLowerCase())
            );
        }

        if (this.paginator) {
            this.paginator.firstPage(); // Reset paginator on filter change
        }
    }

    // Rest of the methods remain the same
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
        this._service.deleteEvent(id).subscribe({
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