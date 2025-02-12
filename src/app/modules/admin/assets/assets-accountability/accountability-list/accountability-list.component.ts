import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AccountabilityService } from 'app/services/accountability/accountability.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';

@Component({
    selector: 'app-accountability-list',
    templateUrl: './accountability-list.component.html',
    styleUrls: ['./accountability-list.component.scss'],
})
export class AccountabilityListComponent implements OnInit {
    displayedColumns: string[] = [
        'accountability_code',
        'tracking_code',
        'computer',
        'assets',
        'owner',
        'department',
        'status',
    ];

    typeFilterControl = new FormControl('');
    filteredTypeOptions: Observable<string[]>;

    dataSource = new MatTableDataSource<any>([]);
    data: any[] = [];

    @ViewChild(MatSort) sort: MatSort;

    constructor(private _service: AccountabilityService) {}

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
    }

    // Fetch data from API and set it in the table
    loadAccountabilityData(): void {
        this._service.getAllAccountability().subscribe(
            (response: any) => {
                if (response && response.$values) {
                    this.data = response.$values;
                    this.dataSource.data = response.$values;
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
}
