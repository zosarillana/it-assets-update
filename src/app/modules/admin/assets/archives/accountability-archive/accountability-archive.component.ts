import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
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
        'accountability_code',
        'tracking_code',
        'owner',
        'department',
        'bu',
        'status'
    ];

    dataSource = new MatTableDataSource<AccountabilityItem>([]);
    pageSize = 10;
    sortOrder: 'asc' | 'desc' = 'asc';
    searchTerm = '';
    totalItems = 0; // <-- This will be overwritten if backend supports it
    pageIndex = 0;
    pageSizeOptions = [10, 15, 20, 50, 100];
    isLoading = false;

    allTypes: string[] = [];
    typeFilterControl = new FormControl('');
    filteredTypeOptions: Observable<string[]>;

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(CustomTooltipComponent) tooltip!: CustomTooltipComponent;

    constructor(
        private _service: ArchivedAccountabilityService,
        private alertService: AlertService,
        private dialog: MatDialog,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadAccountabilityData(this.pageIndex + 1, this.pageSize);

        this.filteredTypeOptions = this.typeFilterControl.valueChanges.pipe(
            startWith(''),
            map((value) => this._filter(value || ''))
        );

        this.typeFilterControl.valueChanges.subscribe((value) => {
            this.searchTerm = value;
            this.pageIndex = 0;
            this.loadAccountabilityData(1, this.pageSize);
        });
    }

    ngAfterViewInit() {
        this.paginator.page.subscribe((event: PageEvent) => {
            this.pageIndex = event.pageIndex;
            this.pageSize = event.pageSize;
            this.loadAccountabilityData(this.pageIndex + 1, this.pageSize);
        });

        this.sort.sortChange.subscribe(() => {
            this.sortOrder = this.sort.direction as 'asc' | 'desc';
            this.pageIndex = 0;
            this.loadAccountabilityData(1, this.pageSize);
        });
    }

    loadAccountabilityData(pageIndex: number = 1, pageSize: number = 10): void {
        this.isLoading = true;
        this._service
            .getAllArchived(
                pageIndex,
                pageSize,
                this.sortOrder,
                this.searchTerm
            )
            .subscribe({
                next: (response: any) => {
                    this.dataSource.data = response.items || response || [];
                    // If backend gives total count:
                    if (response.totalCount !== undefined) {
                        this.totalItems = response.totalCount;
                    } else {
                        // Fallback: just show the count of current items (not ideal)
                        this.totalItems = this.dataSource.data.length;
                    }
                    if (this.paginator) {
                        this.paginator.length = this.totalItems;
                    }
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
                    this.alertService.triggerError('Failed to load accountability data');
                    this.isLoading = false;
                },
            });
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.allTypes.filter((option) =>
            option.toLowerCase().includes(filterValue)
        );
    }

    onTypeSelected(selectedType?: string): void {
        this.searchTerm = selectedType || '';
        this.pageIndex = 0;
        this.loadAccountabilityData(1, this.pageSize);
    }

    applyFilter(value: string): void {
        this.searchTerm = value.trim().toLowerCase();
        this.pageIndex = 0;
        this.loadAccountabilityData(1, this.pageSize);
    }

    onSearch(): void {
        this.pageIndex = 0;
        this.loadAccountabilityData(1, this.pageSize);
    }

    announceSortChange(event: any): void {
        this.sortOrder = event.direction as 'asc' | 'desc';
        this.pageIndex = 0;
        this.loadAccountabilityData(1, this.pageSize);
    }

    resetDataSource(): void {
        this.dataSource.data = [];
        this.totalItems = 0;
        this.searchTerm = '';
        this.typeFilterControl.setValue('');
        this.pageIndex = 0;
        this.loadAccountabilityData(1, this.pageSize);
    }

    returnItem(id: string): void {
        this.router.navigate(['/assets/accountability/return', id]);
    }

    viewResult(id: number): void {
        this.router.navigate(['/assets/accountability-archive/view', id]);
    }

    onMouseMove(event: MouseEvent, row: any): void {
        const tooltipText = this.getTooltipText(row);
        this.tooltip.text = tooltipText;
        this.tooltip.showTooltip(event.clientX, event.clientY);
    }

    onMouseLeave(): void {
        this.tooltip.hideTooltip();
    }

    getTooltipText(row: any): string {
        const date = new Date(row.user_accountability_list?.date_created).toLocaleString(
            'en-US',
            {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }
        );
        return `Created at ${date}`;
    }
}