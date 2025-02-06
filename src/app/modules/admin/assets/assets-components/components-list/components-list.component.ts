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
import { ComponentsService } from 'app/services/components/components.service';

@Component({
  selector: 'app-components-list',
  templateUrl: './components-list.component.html',
  styleUrls: ['./components-list.component.scss']
})
export class ComponentsListComponent implements OnInit {
     displayedColumns: string[] = [
        //   'asset_img',
          'asset_barcode',
          'type',
          'uid',          
          'status',
          
          // 'pc_type',          
        //   'serial_no',
      ];
  
      dataSource = new MatTableDataSource<Assets>();
      pageSize = 10;
      sortOrder = 'asc';
      searchTerm = '';
      totalItems = 0;
      pageSizeOptions = [5, 10, 25, 50];
      isLoading = false;
  
      // Auto-complete
      typeFilterControl = new FormControl('');
      filteredTypeOptions: Observable<string[]>;
      allTypes: string[] = []; // Store unique type values
  
      @ViewChild(MatPaginator) paginator!: MatPaginator;
      @ViewChild(MatSort) sort!: MatSort;
  
      constructor(private assetService: ComponentsService) {}
  
      ngOnInit(): void {
          console.log(this.dataSource.data);
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
  
    //   loadAllTypes(): void {
    //       this.assetService.getAllTypes().subscribe({
    //           next: (types: string[]) => {
    //               this.allTypes = types;
    //           },
    //           error: (error) => {
    //               console.error('Error fetching types:', error);
    //           },
    //       });
    //   }
  
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
  
          this.assetService.getComponents(pageIndex, pageSize, this.sortOrder, this.searchTerm).subscribe({
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
  
      applyTypeFilter(searchValue: string): void {
          this.searchTerm = searchValue.trim().toLowerCase();
  
          if (this.paginator) {
              this.paginator.pageIndex = 0;
          }
  
          this.loadAssets(1, this.pageSize);
      }
  
      filterTypes(value: string): string[] {
          const filterValue = value.toLowerCase();
          return this.allTypes.filter(type => type.toLowerCase().includes(filterValue));
      }
  
      // New method to handle selection from autocomplete
      onTypeSelected(selectedType: string): void {
          this.applyTypeFilter(selectedType);
      }
  
      isValidDate(date: any): boolean {
        return date && !isNaN(new Date(date).getTime());
      }
  }
  