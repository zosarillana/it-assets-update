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
import { Router } from '@angular/router';

// Define an interface for your accountability item
// interface AccountabilityItem {
//     accountability_code: string;
//     tracking_code: string;
//     computer: string;
//     assets: string;
//     owner: string;
//     department: string;
//     status: string;
// }
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
    selector: 'app-accountability-list',
    templateUrl: './accountability-list.component.html',
    styleUrls: ['./accountability-list.component.scss'],
})
export class AccountabilityListComponent implements OnInit, AfterViewInit {
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
        'action'
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
        private _service: AccountabilityService, 
        private alertService: AlertService, 
        private dialog: MatDialog,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.loadAccountabilityData(1, this.pageSize);

        // Set up filtering for autocomplete
        this.filteredTypeOptions = this.typeFilterControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || ''))
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
        
        this._service.getAllAccountability(pageIndex, pageSize, this.sortOrder, this.searchTerm).subscribe({
            next: (response: any) => {
                // Assign data directly - no $values property in this response
                this.dataSource.data = response.items as AccountabilityItem[];
    
                // Update total items for paginator
                this.totalItems = response.totalItems;
                if (this.paginator) {
                    this.paginator.length = this.totalItems;
                }
    
                // Extract unique accountability codes safely
                this.allTypes = [...new Set(
                    this.dataSource.data
                        .map(item => item.user_accountability_list?.accountability_code)
                        .filter(code => code != null)
                )];
                
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error fetching accountability data', error);
                this.alertService.triggerError('Failed to load accountability data');
                this.isLoading = false;
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

    openDeleteDialog(id: string | null | undefined): void {
        console.log('Delete ID:', id); // Debugging log
        if (!id) {
            console.error('Invalid ID:', id);
            this.alertService.triggerError('Invalid item ID.');
            return;
        }
    
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
                // Reload the data after successful deletion
                this.loadAccountabilityData(this.paginator.pageIndex + 1, this.pageSize);
            },
            error: (err) => {
                console.error('Error deleting item:', err);
                this.alertService.triggerError('Failed to delete item.');
            },
        });
    }

    returnItem(id: string): void {
        this.router.navigate(['/assets/accountability/return', id]);
    }

    viewResult(id: number): void {
        // console.log(`Viewing result for accountability ID: ${id}`);
        this.router.navigate(['/assets/accountability/return/result', id]);
    }
}