import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator'; // Import MatPaginator
import { AccountabilityService } from 'app/services/accountability/accountability.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';
import { AlertService } from 'app/services/alert.service';

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

    typeFilterControl = new FormControl('');
    filteredTypeOptions: Observable<string[]>;

    dataSource = new MatTableDataSource<any>([]);
    data: any[] = [];

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator; // Add Paginator ViewChild

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
            map(value => this._filterAutocompleteOptions(value || ''))
        );

        // Define the filterPredicate function for MatTableDataSource
        this.dataSource.filterPredicate = (data, filter: string) => {
            return data.accountability_code.toLowerCase().includes(filter.toLowerCase());
        };
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator; // Assign paginator
    }

    // Fetch data from API and set it in the table
    loadAccountabilityData(): void {
        this._service.getAllAccountability().subscribe(
            (response: any) => {
                if (response && response.$values) {
                    this.data = response.$values;
                    this.dataSource.data = response.$values;
                    this.dataSource.paginator = this.paginator; // Ensure paginator updates when data is loaded
                }
            },
            (error) => {
                console.error('Error fetching accountability data', error);
            }
        );
    }

    // Autocomplete filtering function
    private _filterAutocompleteOptions(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.data
            .map(option => option.accountability_code)
            .filter(code => code.toLowerCase().includes(filterValue));
    }

    // Apply filter when a type is selected from the autocomplete
    onTypeSelected(selectedType?: string): void {
        if (selectedType) {
            this.typeFilterControl.setValue(selectedType, { emitEvent: false });
            this.dataSource.filter = selectedType.toLowerCase(); // Correctly applying the filter
        } else {
            this.dataSource.filter = '';
        }
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
