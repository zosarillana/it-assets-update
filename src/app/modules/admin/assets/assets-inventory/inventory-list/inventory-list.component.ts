import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AssetsService } from 'app/services/assets/assets.service';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetResponse } from 'app/models/Inventory/AssetResponse';

@Component({
    selector: 'app-inventory-list',
    templateUrl: './inventory-list.component.html',
    styleUrls: ['./inventory-list.component.scss'],
})
export class InventoryListComponent implements OnInit {
    displayedColumns: string[] = [
        'asset_img',
        'asset_barcode',
        'type',
        'date_acquired',
        'pc_type',
        'brand',
        'serial_no',
    ];

    dataSource = new MatTableDataSource<Assets>();
    pageSize = 10;
    sortOrder = 'asc';
    searchTerm = '';
    totalItems = 0;
    pageSizeOptions = [5, 10, 25, 50];
    isLoading = false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private assetService: AssetsService) {}

    ngOnInit(): void {
        this.loadAssets(1, this.pageSize);
    }

    ngAfterViewInit(): void {
        // Setup paginator event listener
        this.paginator.page.subscribe((event) => {
            this.loadAssets(event.pageIndex + 1, event.pageSize);
        });

        // Setup sort event listener
        this.sort.sortChange.subscribe((event) => {
            this.sortOrder = event.direction;
            this.loadAssets(1, this.pageSize);
            this.paginator.pageIndex = 0;
        });
    }

    loadAssets(pageIndex: number, pageSize: number): void {
        this.isLoading = true;
        
        this.assetService
            .getAssets(
                pageIndex,
                pageSize,
                this.sortOrder,
                this.searchTerm
            )
            .subscribe({
                next: (response: AssetResponse) => {
                    this.dataSource.data = response.items;
                    this.totalItems = response.totalItems;
                    
                    // Don't set paginator here since we're using server-side pagination
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
}