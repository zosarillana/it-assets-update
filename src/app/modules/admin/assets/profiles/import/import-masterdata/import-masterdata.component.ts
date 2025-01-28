import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AlertService } from 'app/services/alert.service';
import { ImportMasterdataService } from 'app/services/import/import-masterdata.service';
import { ITOTService } from 'app/services/itot.service';
import * as XLSX from 'xlsx'; // Import the XLSX library for parsing Excel files

interface AssetData {
    name: string;
    company: string;
    department: string;
    type: string;
    date_acquired: string;
    asset_barcode: string;
    brand: string;
    model: string;
    ram: string;
    storage: string;
    gpu: string;
    size: string;
    color: string;
    serial_no: string;
    po: string;
    warranty: string;
    cost: string;
    remarks: string;
}

@Component({
    selector: 'app-import-masterdata',
    templateUrl: './import-masterdata.component.html',
    styleUrls: ['./import-masterdata.component.scss'],
})
export class ImportMasterdataComponent implements OnInit {
    data: any[] = [];
    fileSelected: boolean = false; // New property to track file selection
    selectedFileName: string = ''; // New property to track the selected file name
    isLoading = false;
    private selectedFile: File | null = null;

    constructor(
        private alertService: AlertService,
        private _liveAnnouncer: LiveAnnouncer,
        private itotService: ImportMasterdataService
    ) {}

    ngOnInit(): void {}

    // // Helper function to convert Excel date serial to a string
    // private excelDateToString(excelDate: number): string {
    //     if (typeof excelDate === 'number') {
    //         const date = new Date((excelDate - 25569) * 86400 * 1000);
    //         return date.toLocaleDateString();
    //     }
    //     return excelDate;
    // }

    // Handle file selection
    // onFileSelected(event: any) {
    //     const file = event.target.files[0];
    //     this.readFile(file);
    // }

    // Handle drag over
    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Handle drag leave
    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Handle drop
    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.readFile(files[0]);
        }
    }

    private excelDateToString(value: any): string {
      console.log('Parsing date value:', value);  // Log the value being parsed
      if (!value) return 'N/A';
  
      try {
          const dateStr = String(value).trim();
          if (dateStr.includes('/')) {
              const [month, day, year] = dateStr.split('/');
              const date = new Date(+year, +month - 1, +day);
              if (!isNaN(date.getTime())) {
                  return date.toISOString().split('T')[0];
              }
          }
  
          if (typeof value === 'number') {
              const date = new Date(Math.round((value - 25569) * 86400 * 1000));
              return date.toISOString().split('T')[0];
          }
  
          return dateStr || 'N/A';
      } catch (error) {
          console.error('Date parsing failed for value:', value);  // Log the failed date
          return 'N/A';
      }
  }

    private readFile(file: File) {
        if (!file) return;

        if (!this.isExcelFile(file)) {
            this.alertService.triggerError(
                'Please upload only Excel files (.xlsx or .xls)'
            );
            return;
        }

        this.selectedFileName = file.name;
        this.fileSelected = true;

        const reader = new FileReader();
        reader.onload = (e: any) => {
            try {
                const workBook = XLSX.read(e.target.result, { type: 'binary' });
                const sheetName = workBook.SheetNames[0];
                const workSheet = workBook.Sheets[sheetName];
                // Changed to defval: "" to handle empty cells better
                const data = XLSX.utils.sheet_to_json(workSheet, {
                    header: 1, // Extract as a raw 2D array
                    raw: true,
                    defval: '', // Fill empty cells with an empty string
                });

                console.log('Raw Excel data:', data);
                this.data = data;
            } catch (error) {
                console.error('Error reading Excel file:', error);
                this.alertService.triggerError('Error reading Excel file');
            }
        };
        reader.readAsBinaryString(file);
    }

    // Check if file is Excel
    private isExcelFile(file: File): boolean {
        return file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    }


    
    uploadData() {
      if (!this.data || this.data.length === 0) {
          this.alertService.triggerError('No data to upload');
          return;
      }
  
      if (!this.selectedFile) {
          this.alertService.triggerError('Please select a file before uploading.');
          return;
      }
  
      try {
          const dataRows = this.data.slice(1);
          console.log('Raw data rows:', dataRows); // Debugging
          const formattedData = dataRows
              .filter((row) => {
                  const isValid = row && row.length > 0;
                  if (!isValid) {
                      console.warn('Invalid row:', row);
                  }
                  return isValid;
              })
              .map((row) => {
                  try {
                      return {
                          name: String(row[0] || 'N/A').trim(),
                          company: String(row[1] || 'N/A').trim(),
                          department: String(row[2] || 'N/A').trim(),
                          type: String(row[3] || 'N/A').trim(),
                          date_acquired: this.excelDateToString(row[4]),
                          asset_barcode: String(row[5] || 'N/A').trim(),
                          brand: String(row[6] || 'N/A').trim(),
                          model: String(row[7] || 'N/A').trim(),
                          ram: String(row[8] || 'N/A').trim(),
                          storage: String(row[9] || 'N/A').trim(),
                          gpu: String(row[10] || 'N/A').trim(),
                          size: String(row[11] || 'N/A').trim(),
                          color: String(row[12] || 'N/A').trim(),
                          serial_no: String(row[13] || 'N/A').trim(),
                          po: String(row[14] || 'N/A').trim(),
                          warranty: String(row[15] || 'N/A').trim(),
                          cost: String(row[16] || 'N/A').trim(),
                          remarks: String(row[24] || 'N/A').trim(),
                      };
                  } catch (innerError) {
                      console.error('Error formatting row:', row, innerError);
                      return null; // Skip problematic rows
                  }
              })
              .filter((row) => row !== null); // Remove invalid rows
  
          if (formattedData.length === 0) {
              throw new Error('No valid data found in the Excel file');
          }
  
          const formData = new FormData();
          formData.append('file', this.selectedFile);
          formData.append('data', JSON.stringify(formattedData));
  
          this.itotService.uploadExcelData(formData).subscribe({
              next: (response) => {
                  console.log('Upload successful:', response);
                  this.alertService.triggerSuccess('Upload successful!');
                  this.resetForm();
              },
              error: (error) => {
                  console.error('Upload failed:', error);
                  console.error('Error response:', error.error);
                  this.alertService.triggerError(
                      error.error?.message || 'Upload failed. Please try again.'
                  );
              },
          });
      } catch (error: any) {
          console.error('Error processing data:', error);
          this.alertService.triggerError(
              error.message || 'Error processing file data'
          );
      }
  }
  

  onFileSelected(event: any) {
      const file = event.target.files[0];
      this.selectedFile = file;
      this.readFile(file);
  }

  

    // private excelDateToString(value: any): string {
    //     if (!value) return 'N/A';

    //     try {
    //         // First try parsing as a date string
    //         const dateStr = String(value).trim();
    //         if (dateStr.includes('/')) {
    //             const [month, day, year] = dateStr.split('/');
    //             const date = new Date(+year, +month - 1, +day);
    //             if (!isNaN(date.getTime())) {
    //                 return date.toISOString().split('T')[0];
    //             }
    //         }

    //         // If the above fails, try handling as Excel serial number
    //         if (typeof value === 'number') {
    //             const date = new Date(
    //                 Math.round((value - 25569) * 86400 * 1000)
    //             );
    //             return date.toISOString().split('T')[0];
    //         }

    //         return dateStr || 'N/A';
    //     } catch {
    //         return 'N/A';
    //     }
    // }

    private resetForm() {
        this.fileSelected = false;
        this.selectedFileName = '';
        this.data = [];
    }
}
