import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ItotPc } from 'app/models/ItotPc';
import { ITOTService } from 'app/services/itot.service';
import * as XLSX from 'xlsx'; // Keep this for XLSX handling
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { SidePanelPcCardComponent } from '../../../cards/pc/side-panel-pc-card/side-panel-pc-card.component';
import { PcModalCreateComponent } from '../pc-modal-create/pc-modal-create.component';
import { ModalUniversalComponent } from '../../../components/modal/modal-universal/modal-universal.component';
import { AlertService } from 'app/services/alert.service';
import { SidePanelPcsComponent } from '../side-panel-pcs/side-panel-pcs.component';
 

@Component({
    selector: 'app-pc-details',
    templateUrl: './pc-details.component.html',
    styleUrls: ['./pc-details.component.scss'],
})
export class PcDetailsComponent implements OnInit {
    displayedColumns: string[] = [
        'asset_barcode',
        'date_acquired',
        'pc_type',
        'brand',
        'model',        
        'li_description',
        'serial_no',      
        'action',      
    ];
    dataSource = new MatTableDataSource<any>([]); // Initialize with an empty array
    data: any[] = [];

    constructor(
        private _liveAnnouncer: LiveAnnouncer,
        private itotService: ITOTService,
        public dialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private alertService: AlertService
    ) {}

    // Helper function to convert Excel date serial to a string
    private excelDateToString(excelDate: number): string {
        // Check if the value is a valid date
        if (typeof excelDate === 'number') {
            // Adjust for Excel's date system (subtract 25569 to convert to Unix time)
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            return date.toLocaleDateString(); // Format the date as needed (you can customize this)
        }
        return excelDate; // If not a number, return the original value
    }

    // Helper function to replace missing values with 'N/A'
    private replaceMissingValues(row: any[]): any[] {
        return row.map((value) =>
            value === undefined || value === null || value === ''
                ? 'N/A'
                : value
        );
    }

    loadItots(): void {
        this.itotService.getItots().subscribe((result: ItotPc[]) => {
            // After receiving data, assign it to the MatTableDataSource
            this.dataSource = new MatTableDataSource(result);

            // Assign the paginator and sort after data is loaded
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }

    onFileChange(event: any) {
        const target: DataTransfer = <DataTransfer>event.target;
        if (target.files.length !== 1)
            throw new Error('Cannot use multiple files');

        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            const binaryData: string = e.target.result;
            const workbook: XLSX.WorkBook = XLSX.read(binaryData, {
                type: 'binary',
            });
            const firstSheetName: string = workbook.SheetNames[0];
            const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

            // Get the entire sheet data including headers
            this.data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Process the data to convert Excel date to string for the "ACQ. DATE" column
            this.data = this.data.map((row: any[]) => {
                // Ensure we handle the ACQ. DATE, which is assumed to be at index 3
                row[0] = row[0];
                row[1] = row[1];
                row[2] = row[2];
                row[3] = this.excelDateToString(row[3]); // Convert the Excel date
                row[4] = row[4];
                row[5] = row[5];
                row[6] = row[6];
                row[7] = row[7];
                row[8] = row[8];
                row[9] = row[9];
                row[10] = row[10];
                row[11] = row[11];
                row[12] = row[12];
                row[13] = row[13];
                row[14] = row[14];
                row[15] = row[15];
                row[16] = row[16];
                row[17] = row[17];
                // Replace missing values with 'N/A'
                row = this.replaceMissingValues(row);
                return row;
            });

            // Remove the first row (header row) and update dataSource
            this.dataSource.data = this.data
                .slice(1)
                .map((row: any[]) => this.replaceMissingValues(row)); // Update dataSource, skipping the header
        };

        reader.readAsBinaryString(target.files[0]); // Read XLSX as binary string
    }

    uploadData() {
        if (this.data.length === 0) {
            alert('No data to upload.');
            return;
        }

        // Format the data for upload
        const formattedData = this.data.slice(2).map((row: any[]) => ({
            asset_barcode: String(row[0] || "N/A"),
            date_acquired: String(row[1] || "N/A"),
            pc_type: String(row[2] || "N/A"),
            brand: String(this.excelDateToString(row[3])) || "N/A",
            model: String(row[4] || "N/A"),
            processor: String(row[5] || "N/A"),
            ram: String(row[6] || "N/A"),
            storage_capacity: String(row[7] || "N/A"),
            storage_type: String(row[8] || "N/A"),
            operating_system: String(row[9] || "N/A"),
            graphics: String(row[10] || "N/A"),
            size: String(row[11] || "N/A"),
            color: String(row[12] || "N/A"),
            li_description: String(row[13] || "N/A"),
            serial_no: String(row[14] || "N/A"),  
          }));

        // Check the final data structure
        console.log(
            'Data to be uploaded:',
            JSON.stringify(formattedData, null, 2)
        );

        // Send the formatted data to your backend
        this.itotService.uploadExcelData(formattedData).subscribe(
            (response) => {
                console.log('Upload successful:', response);
                alert('Upload successful!');
            },
            (error) => {
                console.error('Upload failed:', error);
                alert('Upload failed. Please try again.');
            }
        );
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(PcModalCreateComponent, {
            //data: { name: 'User Name' }, // You can pass any data here to the modal
            height: '60%',
            width: '50%',
        });
  
        dialogRef.afterClosed().subscribe((result) => {
            console.log('Dialog closed, result:', result);
    
            // Check if the result indicates success
            if (result && result.success) {
                console.log('Peripheral created successfully.');
                this.loadItots(); // Reload the peripherals list after creation
            } else {
                console.log('Peripheral creation was cancelled or failed.');
            }
        });
    }

    openSidePanelWithId(id: string) {
        this.sidePanel.elementId = id; // Pass the ID
        this.sidePanel.openSidenav(); // Open the side panel
    }
    
    openEditSidePanel(element: any) {
        this.sidePanel.elementId = element; // Pass the element data to the edit side panel
        this.sidePanel.openEditSidePanel(element); // Open the sidenav
    }

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('sidePanel') sidePanel!: SidePanelPcsComponent;

    ngOnInit(): void {
        // Any initialization logic can be added here
        this.loadItots();
    }

    ngAfterViewInit() {
        // Ensure paginator is assigned after view initialization
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    // Method to filter based on Inventory Tag
    applyInventoryTagFilter(filterValue: string) {
        this.dataSource.filterPredicate = (data: any, filter: string) => {
            return data.asset_barcode
                .toLowerCase()
                .includes(filter.toLowerCase());
        };

        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    /** Announce the change in sort state for assistive technology. */
    announceSortChange(sortState: Sort) {
        if (sortState.direction) {
            this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
        } else {
            this._liveAnnouncer.announce('Sorting cleared');
        }
    }

    deletePc(id: number): void {
        const dialogRef = this.dialog.open(ModalUniversalComponent, {
            width: '400px',
            data: { name: 'Delete Confirmation' }
        });
    
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log(`Deleting peripheral with ID ${id}`);
                this.itotService.DeletePc(id).subscribe({
                    next: () => {
                        console.log(`Peripheral with ID ${id} deleted successfully.`);
                        this.alertService.triggerSuccess('Peripheral deleted successfully.'); // Show success alert
                        this.loadItots(); // Reload the list after deletion
                        
                    },
                    error: (err) => {
                        console.error('Error deleting peripheral:', err);
                        this.alertService.triggerError('Error deleting peripheral.'); // Show error alert
                    }
                });
            } else {
                console.log('Deletion cancelled by the user.');
                // Optionally, you can show an alert if you want to notify that deletion was cancelled.
                // Example: this.alertService.triggerInfo('Deletion cancelled');
            }
        });
    }       
}
