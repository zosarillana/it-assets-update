import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'app/services/alert.service';
import { Router } from '@angular/router';
import { ArchivedAccountabilityService } from 'app/services/archive/archived-accountability.service';
import { CustomTooltipComponent } from '../../components/custom-tooltip/custom-tooltip.component';


interface AccountabilityItem {
    user_accountability_list: {
        id: number;
        accountability_code: string;
        tracking_code: string;
        date_created: string;
        is_active: boolean;
    };
    owner: {
        id: number;
        name: string;
        company: string;
        department: string;
        employee_id: string | null;
        designation: string | null;
    };
    assets: any[];
    computers: any[];
}

@Component({
    selector: 'app-accountability-archive',
    templateUrl: './accountability-archive.component.html',
    styleUrls: ['./accountability-archive.component.scss'],
})
export class AccountabilityArchiveComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        // 'image',
        'accountability_code',
        'tracking_code',
        // 'computer',
        // 'assets',
        'owner',
        'department',
        'bu',
        'status',
        // 'action'
    ];

    dataSource = new MatTableDataSource<AccountabilityItem>([]);
    pageSize = 10;
    sortOrder = 'asc';
    searchTerm = '';
    totalItems = 0;
    pageSizeOptions = [5, 10, 25, 50];
    isLoading = false;

    // Explicitly type allTypes as string[]
    allTypes: string[] = [];
    typeFilterControl = new FormControl('');
    filteredTypeOptions: Observable<string[]>;

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(
        private _service: ArchivedAccountabilityService,
        private alertService: AlertService,
        private dialog: MatDialog,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadAccountabilityData(1, this.pageSize);

        // Set up filtering for autocomplete
        this.filteredTypeOptions = this.typeFilterControl.valueChanges.pipe(
            startWith(''),
            map((value) => this._filter(value || ''))
        );

        // Listen for changes and apply filter dynamically
        this.typeFilterControl.valueChanges.subscribe((value) => {
            this.searchTerm = value;
            if (this.paginator) {
                this.paginator.pageIndex = 0;
            }
            this.loadAccountabilityData(1, this.pageSize);
        });
    }

    ngAfterViewInit() {
        this.paginator.page.subscribe((event) => {
            this.loadAccountabilityData(event.pageIndex + 1, event.pageSize);
        });

        this.sort.sortChange.subscribe(() => {
            this.sortOrder = this.sort.direction;
            this.paginator.pageIndex = 0;
            this.loadAccountabilityData(1, this.pageSize);
        });
    }

    loadAccountabilityData(pageIndex: number = 1, pageSize: number = 10): void {
        this.isLoading = true;

        this._service
            .getAllArchived(
                pageIndex,
                pageSize,
                this.sortOrder as 'asc' | 'desc',
                this.searchTerm
            )
            .subscribe({
                next: (response: any) => {
                    // The response is a flat list, no pagination metadata
                    this.dataSource.data = response as AccountabilityItem[];

                    // If backend doesn't return total count, use length of current data
                    this.totalItems = this.dataSource.data.length;

                    if (this.paginator) {
                        this.paginator.length = this.totalItems;
                    }

                    // Extract unique accountability codes
                    this.allTypes = [
                        ...new Set(
                            this.dataSource.data
                                .map(
                                    (item) =>
                                        item.user_accountability_list
                                            ?.accountability_code
                                )
                                .filter((code) => code != null)
                        ),
                    ];

                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error fetching accountability data', error);
                    this.alertService.triggerError(
                        'Failed to load accountability data'
                    );
                    this.isLoading = false;
                },
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
            this.searchTerm = '';
        } else {
            this.searchTerm = selectedType;
        }

        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }

        this.loadAccountabilityData(1, this.pageSize);
    }

    // General filter application method
    applyFilter(value: string): void {
        this.searchTerm = value.trim().toLowerCase();

        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }

        this.loadAccountabilityData(1, this.pageSize);
    }

    onSearch(): void {
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadAccountabilityData(1, this.pageSize);
    }

    announceSortChange(event: any): void {
        this.sortOrder = event.direction;
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadAccountabilityData(1, this.pageSize);
    }

    resetDataSource(): void {
        this.dataSource.data = [];
        this.totalItems = 0;
        this.searchTerm = '';
        this.typeFilterControl.setValue('');
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadAccountabilityData(1, this.pageSize);
    }

    returnItem(id: string): void {
        this.router.navigate(['/assets/accountability/return', id]);
    }

    viewResult(id: number): void {
        // console.log(`Viewing result for accountability ID: ${id}`);
        this.router.navigate(['/assets/accountability-archive/view', id]);
    }

    //tooltip
    @ViewChild(CustomTooltipComponent) tooltip!: CustomTooltipComponent;

    onMouseMove(event: MouseEvent, row: any): void {
        const tooltipText = this.getTooltipText(row);
        this.tooltip.text = tooltipText;
        this.tooltip.showTooltip(event.clientX, event.clientY); // Pass mouse coordinates
    }

    onMouseLeave(): void {
        this.tooltip.hideTooltip(); // Hide tooltip when the mouse leaves the row
    }

    getTooltipText(row: any): string {
        // Customize your tooltip text as needed
        return `CLICK TO VIEW ${row.accountability?.accountability_code}`;
    }
}
