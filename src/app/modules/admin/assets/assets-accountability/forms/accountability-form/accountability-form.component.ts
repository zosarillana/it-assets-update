import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AccountabilityService } from 'app/services/accountability/accountability.service';

// Interfaces
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

interface AssignedAssetData {
    id: number;
    type: string;
    asset_barcode: string;
    brand: string;
    model: string;
    date_acquired: string;
    status: string;
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
    assignedAssetDetails?: { 
        $id: string;
        $values: AssignedAssetData[];
    };
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

     // ✅ Create 3 data sources
     dataSourceAssets = new MatTableDataSource<AssetData>(); // Holds assets
     dataSourceComputers = new MatTableDataSource<ComputerData>(); // Holds computers
     dataSourceAssignedAssets = new MatTableDataSource<AssignedAssetData>(); // Holds assigned assets

    constructor(
        private route: ActivatedRoute,
        private _service: AccountabilityService
    ) {}
    @ViewChild('paginatorAssets') paginatorAssets!: MatPaginator;
    @ViewChild('paginatorComputers') paginatorComputers!: MatPaginator;
    @ViewChild('paginatorAssignedAssets') paginatorAssignedAssets!: MatPaginator;
    
    @ViewChild('paginator1') paginator1!: MatPaginator;
    @ViewChild('paginator2') paginator2!: MatPaginator;
    @ViewChild('sort1') sort1!: MatSort;
    @ViewChild('sort2') sort2!: MatSort;

    asset!: Accountability;

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
    
        if (id) {
            this._service.getAccountabilityById(id).subscribe({
                next: (data: any) => {
                    console.log('Fetched Data:', data);
                    this.asset = data;
    
                    // ✅ Assign assets if available
                    if (this.asset?.assets?.$values?.length) {
                        this.dataSourceAssets.data = this.asset.assets.$values;
                    }
                    console.log('Assets Data Source:', this.dataSourceAssets.data);
    
                    // ✅ Assign computers if available
                    if (this.asset?.computers?.$values?.length) {
                        this.dataSourceComputers.data = this.asset.computers.$values;
                    }
                    console.log('Computers Data Source:', this.dataSourceComputers.data);
    
                    // ✅ Extract assigned assets correctly
                    let assignedAssets: AssignedAssetData[] = [];
                    this.asset.computers?.$values.forEach((computer) => {
                        if (computer.assignedAssetDetails?.$values?.length) {
                            assignedAssets.push(...computer.assignedAssetDetails.$values);
                        }
                    });
    
                    this.asset.computers?.$values.forEach((computer) => {
                        if (computer.assignedAssetDetails?.$values?.length) {
                            assignedAssets.push(...computer.assignedAssetDetails.$values);
                        }
                    });
                    this.dataSourceAssignedAssets.data = assignedAssets;
                    
                    // ✅ Assign extracted data to dataSourceAssignedAssets
                    this.dataSourceAssignedAssets.data = assignedAssets;
                    console.log('Assigned Assets Data Source:', this.dataSourceAssignedAssets.data);
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
