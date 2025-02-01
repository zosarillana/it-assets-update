import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AccountabilityService } from 'app/services/accountability/accountability.service';
// Update interfaces
interface Accountability {
    userAccountabilityList: any;
    owner: any;
    assets: {
        $id: string;
        $values: AssetData[];
    };
    computers: {
        $id: string;
        $values: ComputerData[];
      };
}

interface AssetData {
    id: number;
    type: string;
    asset_barcode: string;
    brand: string;
    model: string;
    date_created: string;
    history: {
        $id: string;
        $values: string[];
    };
    is_deleted: boolean;
}

interface ComputerData {
    id: number;
    type: string;
    asset_barcode: string;
    brand: string;
    model: string;
    date_created: string;
    history: {
        $id: string;
        $values: string[];
    };
    is_deleted: boolean;
}
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
    // Two separate data sources if needed:
  dataSource = new MatTableDataSource<AssetData>();      // For assets
  dataSource2 = new MatTableDataSource<ComputerData>();    // For computers

  constructor(
    private route: ActivatedRoute,
    private _service: AccountabilityService
  ) {}

  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild('sort1') sort1!: MatSort;
  @ViewChild('sort2') sort2!: MatSort;

  asset!: Accountability;
  ngOnInit() {
    // Set up first table
    this.dataSource.paginator = this.paginator1;
    this.dataSource.sort = this.sort1;
    
    // Set up second table
    this.dataSource2.paginator = this.paginator2;
    this.dataSource2.sort = this.sort2;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
        this._service.getAccountabilityById(id).subscribe({
            next: (data: any) => {  
                console.log('Fetched Data:', data);
                this.asset = data;

                if (this.asset?.assets?.$values) {
                    this.dataSource.data = this.asset.assets.$values;
                }
                if (this.asset?.computers?.$values) {
                    this.dataSource2.data = this.asset.computers.$values;
                }
            },
            error: (err) => console.error('Error fetching asset', err),
        });
    }
}

    printForm() {
        const printContents =
            document.getElementById('printableArea')?.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents || '';
        window.print();
        document.body.innerHTML = originalContents; // Restore the page after printing
    }
}
