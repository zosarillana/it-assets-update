import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ItotPc } from 'app/models/ItotPc';
import { AlertService } from 'app/services/alert.service';
import { ITOTService } from 'app/services/itot.service';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';
import { PcModalCreateComponent } from '../../details/pc/pc-modal-create/pc-modal-create.component';
import { SidePanelPcsComponent } from '../../details/pc/side-panel-pcs/side-panel-pcs.component';
import * as XLSX from 'xlsx'; // Keep this for XLSX handling
import { AccountabilityService } from 'app/services/accountability/accountability.service';

@Component({
    selector: 'app-accountability-list',
    templateUrl: './accountability-list.component.html',
    styleUrls: ['./accountability-list.component.scss'],
})
export class AccountabilityListComponent implements OnInit {
    displayedColumns: string[] = [
        'accountability_code',        
        'tracking_code',
        'owner',
        // 'owner',
        // 'brand',
        // // 'owner_id',
    ];

    dataSource = new MatTableDataSource<any>([]); // Initialize with an empty array
    data: any[] = [];

    constructor(private _service: AccountabilityService) {} // Inject your service

    ngOnInit(): void {
        this.loadAccountabilityData();
    }

    accountabilityData: string[] = []; // Variable to store the data
    loadAccountabilityData(): void {
        this._service.getAllAccountability().subscribe(
            (response: any) => {
                // Assuming the API response has a property "$values" that holds the array of data
                if (response && response.$values) {
                    this.dataSource.data = response.$values; // Assign data to MatTableDataSource
                }
            },
            (error) => {
                console.error('Error fetching accountability data', error);
            }
        );
    }
}
