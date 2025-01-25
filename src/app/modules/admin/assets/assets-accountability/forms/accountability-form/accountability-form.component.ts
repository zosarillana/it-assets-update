import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'app-accountability-form',
    templateUrl: './accountability-form.component.html',
    styleUrls: ['./accountability-form.component.scss'],
})
export class AccountabilityFormComponent implements OnInit {
    displayedColumns: string[] = [
        'type',
        'dateAcquired',
        'assetBarcode',
        'brand',
        'model',
        'personalHistory',
        'status',
    ];
    dataSource = new MatTableDataSource(ELEMENT_DATA);

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    ngOnInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    printForm() {
      const printContents = document.getElementById('printableArea')?.innerHTML;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = printContents || '';
      window.print();
      document.body.innerHTML = originalContents; // Restore the page after printing
    }
}

export interface Asset {
    type: string;
    dateAcquired: string;
    assetBarcode: string;
    brand: string;
    model: string;

    personalHistory: string;
    status: string;
}


const ELEMENT_DATA = [
  {
    type: 'Laptop',
    dateAcquired: '2022-05-15',
    assetBarcode: 'A00123',
    brand: 'Apple',
    model: 'MacBook Pro 14"',
    personalHistory: 'Alice, Bob, Charles',
    status: 'In Use',
  },
  {
    type: 'Smartphone',
    dateAcquired: '2023-02-10',
    assetBarcode: 'B04567',
    brand: 'Samsung',
    model: 'Galaxy S22',
    personalHistory: 'David, Emma',
    status: 'In Repair',
  },
  {
    type: 'Desktop',
    dateAcquired: '2021-11-30',
    assetBarcode: 'C07890',
    brand: 'HP',
    model: 'Omen 30L',
    personalHistory: 'Frank, George',
    status: 'Retired',
  },
  {
    type: 'Tablet',
    dateAcquired: '2023-03-05',
    assetBarcode: 'D11234',
    brand: 'Microsoft',
    model: 'Surface Pro 8',
    personalHistory: 'Helen, Isaac',
    status: 'Active',
  },
];


