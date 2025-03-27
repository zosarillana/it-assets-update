import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BusinessUnit } from 'app/models/BusinessUnit/BusinessUnit';
import { Department } from 'app/models/Department/Department';
import { BusinessUnitService } from 'app/services/business-unit/business-unit.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-business-units',
  templateUrl: './business-units.component.html',
  styleUrls: ['./business-units.component.scss']
})
export class BusinessUnitsComponent implements OnInit {
    businessUnits: BusinessUnit[] = []; // Holds the fetched departments
    errorMessage: string = ''; // Holds error messages (if any)

    pageSize = 10;
    sortOrder = 'asc';
    searchTerm = '';
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    constructor(private businessUnitService: BusinessUnitService) {}
    dataSource = new MatTableDataSource<BusinessUnit>();

    displayedColumns: string[] = [
        'code',
        'description',
        // 'action'
    ];

    ngOnInit(): void {
        this.loadBusinessUnits();

        this.filteredTypeOptions = this.typeFilterControl.valueChanges.pipe(
            startWith(''),
            map((value) => this._filter(value))
        );

        // Listen for changes and apply filter dynamically
        this.typeFilterControl.valueChanges.subscribe((value) => {
            this.applyFilter(value);
        });
    }

    ngAfterViewInit() {
        // Connect paginator to dataSource after view is initialized
        this.dataSource.paginator = this.paginator;
    }

    private loadBusinessUnits(): void {
        this.businessUnitService.getDepartments().subscribe({
            next: (data) => {
                this.businessUnits = data;
                this.dataSource.data = this.businessUnits;

                // Extract unique codes for autocomplete suggestions
                this.allTypes = [...new Set(data.map((dept) => dept.code))];

                // Ensure paginator works after data loads
                setTimeout(() => {
                    if (this.paginator) {
                        this.dataSource.paginator = this.paginator;
                    }
                });
            },
            error: (error) => {
                console.error('Error fetching businessUnits', error);
                this.errorMessage = 'Failed to load businessUnits';
            },
        });
    }

    announceSortChange(event: any): void {
        this.sortOrder = event.direction;
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadBusinessUnits();
    }

    //Mat auto complete
    allTypes: string[] = []; // Store unique type values
    typeFilterControl = new FormControl('');
    filteredTypeOptions: Observable<string[]>;
    selectedTypeToggle: string[] = [];

    onTypeSelected(selectedType?: string): void {
        if (!selectedType) {
            this.dataSource.data = this.businessUnits; // Reset data if empty
            return;
        }

        this.dataSource.data = this.businessUnits.filter((dept) =>
            dept.code.toLowerCase().includes(selectedType.toLowerCase())
        );

        if (this.paginator) {
            this.paginator.firstPage(); // Reset pagination on filter
        }
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.allTypes.filter((option) =>
            option.toLowerCase().includes(filterValue)
        );
    }

    applyFilter(value: string): void {
        if (!value) {
            this.dataSource.data = this.businessUnits; // Reset to all data
        } else {
            this.dataSource.data = this.businessUnits.filter((dept) =>
                dept.code.toLowerCase().includes(value.toLowerCase())
            );
        }

        if (this.paginator) {
            this.paginator.firstPage(); // Reset paginator on filter change
        }
    }
}
