import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-computers-add',
    templateUrl: './computers-add.component.html',
    styleUrls: ['./computers-add.component.scss'],
})
export class ComputersAddComponent implements OnInit {
    items: any[] = []; // Stores rows

    itemTypes: string[] = ['RAM', 'BOARD', 'SSD', 'HDD', 'GPU'];
    constructor() {}

    ngOnInit(): void {}

    previewSelectedImage(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = (e: ProgressEvent<FileReader>) => {
                const previewImage = document.getElementById(
                    'preview-image'
                ) as HTMLImageElement;
                if (previewImage) {
                    previewImage.src = e.target?.result as string;
                }
            };

            reader.readAsDataURL(file);
        }
    }
    addRow() {
        this.items.push({
          itemType: 'RAM', // Default selection
          itemCode: '',
          description: '',
          remarks: ''
        });
      }
    
      removeRow(index: number) {
        this.items.splice(index, 1);
      }

      accessories = [
        // { type: "USB-C ADAPTER", date_acquired: "2021-06-02", asset_barcode: "000163", brand: "APPLE", model: "A2164" },
        // { type: "KEYBOARD USB", date_acquired: "2014-01-11", asset_barcode: "01-01-03-000075-03", brand: "DELL", model: "KB216T" },
        // { type: "MOUSE USB", date_acquired: "2014-01-11", asset_barcode: "01-01-03-000075-04", brand: "DELL", model: "MSIII-T" },
        // { type: "MONITOR", date_acquired: "2023-02-14", asset_barcode: "01-01-09-004268-02", brand: "N-VISION", model: "N2755" },
        // { type: "MONITOR", date_acquired: "2018-06-21", asset_barcode: "01-26-13-000024-02", brand: "ACER", model: "K22HQL" },
        // { type: "KEYBOARD USB", date_acquired: "2018-06-21", asset_barcode: "01-26-13-000024-03", brand: "MICROPACK", model: "KM-2010" },
        // { type: "MOUSE USB", date_acquired: "2018-06-21", asset_barcode: "01-26-13-000024-04", brand: "MICROPACK", model: "KM-2010" },
        // { type: "UPS", date_acquired: "2018-06-21", asset_barcode: "01-26-13-000025-01", brand: "APC", model: "BX625CI-MS" },
        // { type: "BAG", date_acquired: "2023-03-14", asset_barcode: "01-01-02-004278-03", brand: "LENOVO", model: "NULL" },
        // { type: "AC ADAPTER", date_acquired: "2020-07-23", asset_barcode: "01-26-13-000051-02", brand: "HP", model: "NULL" },
        // { type: "AC ADAPTER", date_acquired: "2021-11-26", asset_barcode: "04-01-00-000299-02", brand: "LENOVO", model: "ADLX65CLGU2A" },
        // { type: "MOUSE WIRELESS", date_acquired: "2021-11-26", asset_barcode: "04-01-00-000299-03", brand: "A4TECH", model: "G3-300N" },
        // { type: "BAG BACKPACK", date_acquired: "2021-11-26", asset_barcode: "04-01-00-000299-04", brand: "LENOVO", model: "NULL" }
      ];
      
      addAccessoryRow() {
        this.accessories.push({ type: "", date_acquired: "", asset_barcode: "", brand: "", model: "" });
      }
      
      removeAccessoryRow(index: number) {
        this.accessories.splice(index, 1);
      }
      
}
