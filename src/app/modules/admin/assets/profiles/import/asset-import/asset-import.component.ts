import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Component, OnInit } from "@angular/core";
import { ITOTService } from "app/services/itot.service";
import * as XLSX from 'xlsx'; // Import the XLSX library for parsing Excel files

@Component({
  selector: "app-asset-import",
  templateUrl: "./asset-import.component.html",
  styleUrls: ["./asset-import.component.scss"],
})
export class AssetImportComponent implements OnInit {
  data: any[] = [];
  fileSelected: boolean = false; // New property to track file selection
  selectedFileName: string = ""; // New property to track the selected file name

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private itotService: ITOTService
  ) {}

  ngOnInit(): void {}

  // Helper function to convert Excel date serial to a string
  private excelDateToString(excelDate: number): string {
    if (typeof excelDate === "number") {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toLocaleDateString();
    }
    return excelDate; 
  }

  // Method to handle file selection from input
  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length === 1) { // Ensure only one file is selected
      const file = target.files[0];
      this.selectedFileName = file.name; // Update selected file name
      this.readFile(file);
    } else {
      this.fileSelected = false; // Reset if no file is selected
      this.selectedFileName = ""; // Reset selected file name
      alert("Please select exactly one file.");
    }
  }

  // Method to read file from input or drop event
  private readFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const worksheet = workbook.Sheets[sheetName];
      this.data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Parse the data
      console.log("Data loaded from Excel:", this.data);
      
      this.fileSelected = true; // Mark file as selected
    };

    reader.readAsBinaryString(file); // Read the file as binary string
  }

  // Drag and drop methods
  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
    event.stopPropagation(); // Stop the event from propagating
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Optionally, you can add logic here to change the styling back
  }

  onDrop(event: DragEvent): void {
    event.preventDefault(); // Prevent default behavior
    event.stopPropagation(); // Stop the event from propagating

    if (event.dataTransfer && event.dataTransfer.files) {
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.selectedFileName = files[0].name; // Update selected file name
        this.readFile(files[0]); // Call readFile with the dropped file
      }
    }
  }

  uploadData() {
    if (this.data.length === 0) {
      alert("No data to upload.");
      return;
    }

    const formattedData = this.data.slice(1).map((row: any[]) => ({
      asset_barcode: String(row[0] || "N/A"),
      date_acquired: String(this.excelDateToString(row[1])) || "N/A",
      pc_type: String(row[2] || "N/A"),
      brand: String(row[3] || "N/A"),
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
      assigned: String(row[15] || "Not Assigned"),
      status: String(row[16] || "Active"),
      history: String(row[16] || " "),

    }));

    console.log("Data to be uploaded:", JSON.stringify(formattedData, null, 2));

    this.itotService.uploadExcelData(formattedData).subscribe(
      (response) => {
        console.log("Upload successful:", response);
        alert("Upload successful!");
        this.fileSelected = false; // Reset file selection after upload
        this.selectedFileName = ""; // Reset selected file name
      },
      (error) => {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      }
    );
  }
}
