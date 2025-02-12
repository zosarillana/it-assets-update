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
import { ComputerService } from 'app/services/computer/computer.service';

@Component({
  selector: 'app-computers-list',
  templateUrl: './computers-list.component.html',
  styleUrls: ['./computers-list.component.scss']
})
export class ComputersListComponent  implements OnInit, AfterViewInit {
    displayedColumns: string[] = [
        // 'asset_img',
        'asset_barcode',
        'type',        
        // 'pc_type',
        'brand',
        'model',        
        'serial_no',
        'active_user',
        'bu',
        'status',
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

    constructor(private assetService: ComputerService) {}

    ngOnInit(): void {
        console.log(this.dataSource.data);
        // this.loadAllTypes(); // Load types dynamically
        this.loadAssets(1, this.pageSize);
    
        // Set up the autocomplete filter
        this.filteredTypeOptions = this.typeFilterControl.valueChanges.pipe(
            startWith(''),
            map(value => this.filterTypes(value))
        );

        // Subscribe to valueChanges to dynamically filter the table
        this.typeFilterControl.valueChanges.subscribe(value => {
            this.applyTypeFilter(value);
        });
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.allTypes.filter(option => option.toLowerCase().includes(filterValue));
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

    loadAssets(pageIndex: number, pageSize: number): void {
        this.isLoading = true;

        this.assetService.getAssets(pageIndex, pageSize, this.sortOrder, this.searchTerm).subscribe({
            next: (response: AssetResponse) => {
                console.log('API Response:', response);

                // Extract $values safely
                this.dataSource.data = (response.items as any)?.$values ?? (response.items as Assets[]);

                // Update total items for paginator
                this.totalItems = response.totalItems;
                this.paginator.length = this.totalItems;

                // Extract unique types from the assets
                this.allTypes = [...new Set(this.dataSource.data.map(asset => asset.type))];

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

    // applyTypeFilter(searchValue: string): void {
    //     this.searchTerm = searchValue.trim().toLowerCase();

    //     if (this.paginator) {
    //         this.paginator.pageIndex = 0;
    //     }

    //     this.loadAssets(1, this.pageSize);
    // }

    // In your component
applyTypeFilter(searchValue: string): void {
    this.searchTerm = searchValue.trim().toLowerCase();

    if (this.paginator) {
        this.paginator.pageIndex = 0;
    }

    // Optional: You could add client-side filtering as a fallback
    this.dataSource.filter = this.searchTerm;
    
    // Keep your server-side pagination/filtering
    this.loadAssets(1, this.pageSize);
}

    filterTypes(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.allTypes.filter(type => type.toLowerCase().includes(filterValue));
    }

    // New method to handle selection from autocomplete
    onTypeSelected(selectedType?: string): void {
        // If selectedType is provided from autocomplete, use it
        if (selectedType) {
            this.selectedTypeToggle = [selectedType]; // Set it in the toggle buttons
        }
    
        // Create a filter predicate that checks for the selected types
        this.dataSource.filterPredicate = (data: Assets) => {
            // If no filters are selected, show all data
            if (this.selectedTypeToggle.length === 0) {
                return true;
            }
            // Filter the table based on selected types
            return this.selectedTypeToggle.includes(data.type);
        };
    
        // Apply the filter
        this.dataSource.filter = 'applyFilter'; // Triggers filtering
    }
    isValidDate(date: any): boolean {
      return date && !isNaN(new Date(date).getTime());
    }    
}