import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PeripheralService, Peripheral } from 'app/services/peripheral/peripheral.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-peripheral-type',
  templateUrl: './peripheral-type.component.html',
  styleUrls: ['./peripheral-type.component.scss']
})
export class PeripheralTypeComponent implements OnInit {
  peripherals: Peripheral[] = [];
  errorMessage: string = '';

  pageSize = 10;
  sortOrder = 'asc';
  searchTerm = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<Peripheral>();

  displayedColumns: string[] = ['type', 'description',];

  constructor(private peripheralService: PeripheralService) {}

  ngOnInit(): void {
    this.loadPeripherals();

    this.filteredTypeOptions = this.typeFilterControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.typeFilterControl.valueChanges.subscribe(value => {
      this.applyFilter(value);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private loadPeripherals(): void {
    this.peripheralService.getPeripherals().subscribe({
      next: (data) => {
        this.peripherals = data;
        this.dataSource.data = this.peripherals;

        this.allTypes = [...new Set(data.map(p => p.type))];

        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        });
      },
      error: (error) => {
        console.error('Error fetching peripherals', error);
        this.errorMessage = 'Failed to load peripheral types';
      }
    });
  }

  announceSortChange(event: any): void {
    this.sortOrder = event.direction;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadPeripherals();
  }

  allTypes: string[] = [];
  typeFilterControl = new FormControl('');
  filteredTypeOptions: Observable<string[]>;
  selectedTypeToggle: string[] = [];

  onTypeSelected(selectedType?: string): void {
    if (!selectedType) {
      this.dataSource.data = this.peripherals;
      return;
    }

    this.dataSource.data = this.peripherals.filter(p =>
      p.type.toLowerCase().includes(selectedType.toLowerCase())
    );

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTypes.filter(option =>
      option.toLowerCase().includes(filterValue)
    );
  }

  applyFilter(value: string): void {
    if (!value) {
      this.dataSource.data = this.peripherals;
    } else {
      this.dataSource.data = this.peripherals.filter(p =>
        p.type.toLowerCase().includes(value.toLowerCase())
      );
    }

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
}
