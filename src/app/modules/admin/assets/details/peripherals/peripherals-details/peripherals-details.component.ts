import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ItotPeripheral } from 'app/models/ItotPeripheral';
import { ITOTService } from 'app/services/itot.service';
import { SidePanelPeripheralsComponent } from './side-panel-peripherals/side-panel-peripherals.component';
import { PeripheralModalCreateComponent } from './peripheral-modal-create/peripheral-modal-create.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalUniversalComponent } from '../../../components/modal/modal-universal/modal-universal.component';
import { AlertService } from 'app/services/alert.service';

@Component({
    selector: 'app-peripherals-details',
    templateUrl: './peripherals-details.component.html',
    styleUrls: ['./peripherals-details.component.scss'],
})
export class PeripheralsDetailsComponent implements OnInit {
    displayedColumns: string[] = [
        'asset_barcode',
        'date_acquired',
        'brand',
        'model',
        'peripheral_type',
        'size',
        'color',
        'li_description',
        'serial_no',
        'action',
    ];
   
    dataSource = new MatTableDataSource<any>([]);
    data: any[] = []; 

    constructor(
        private _liveAnnouncer: LiveAnnouncer,
        private itotService: ITOTService,
        public dialog: MatDialog,
        public alertService: AlertService,
        private cdr: ChangeDetectorRef,
    ) {}

    loadItots(): void {
        this.itotService.getItotPeripherals().subscribe((result: ItotPeripheral[]) => {
            // console.log('Updated peripherals list after delete:', result);
            this.dataSource = new MatTableDataSource(result);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.cdr.detectChanges();  // Ensure view updates
        });
    }    

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('sidePanel') sidePanel!: SidePanelPeripheralsComponent;    
    
    ngOnInit(): void {
        this.loadItots();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    applyInventoryTagFilter(filterValue: string) {
        this.dataSource.filterPredicate = (data: any, filter: string) => {
            return data.asset_barcode
                .toLowerCase()
                .includes(filter.toLowerCase());
        };

        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    openSidePanelWithId(id: string) {
        this.sidePanel.elementId = id; // Pass the ID
        this.sidePanel.openSidenav(); // Open the side panel
    }

    openEditSidePanel(element: any) {
        this.sidePanel.elementId = element; // Pass the element data to the edit side panel
        this.sidePanel.openEditSidePanel(element); // Open the sidenav
    }
    
    openDialog(): void {
        const dialogRef = this.dialog.open(PeripheralModalCreateComponent, {
            height: '60%',
            width: '50%',
        });
    
        dialogRef.afterClosed().subscribe((result) => {
            // console.log('Dialog closed, result:', result);
    
            // Check if the result indicates success
            if (result && result.success) {
                // console.log('Peripheral created successfully.');
                this.loadItots(); // Reload the peripherals list after creation
            } else {
                // console.log('Peripheral creation was cancelled or failed.');
            }
        });
    }

    deletePeripheral(id: number): void {
        const dialogRef = this.dialog.open(ModalUniversalComponent, {
            width: '400px',
            data: { name: 'Delete Confirmation' }
        });
    
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // console.log(`Deleting peripheral with ID ${id}`);
                this.itotService.DeletePeripheral(id).subscribe({
                    next: () => {
                        // console.log(`Peripheral with ID ${id} deleted successfully.`);
                        this.alertService.triggerSuccess('Peripheral deleted successfully.'); // Show success alert
                        this.loadItots(); // Reload the list after deletion
                    },
                    error: (err) => {
                        // console.error('Error deleting peripheral:', err);
                        this.alertService.triggerError('Error deleting peripheral.'); // Show error alert
                    }
                });
            } else {
                // console.log('Deletion cancelled by the user.');
                // Optionally, you can show an alert if you want to notify that deletion was cancelled.
                // Example: this.alertService.triggerInfo('Deletion cancelled');
            }
        });
    }    

    announceSortChange(sortState: Sort) {
        if (sortState.direction) {
            this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
        } else {
            this._liveAnnouncer.announce('Sorting cleared');
        }
    } 
}
