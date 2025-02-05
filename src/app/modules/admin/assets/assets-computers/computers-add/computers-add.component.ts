import { Component, OnInit } from '@angular/core';

interface Asset {
    id: number;
    type: string;
    date_acquired: string;
    asset_barcode: string;
    brand: string;
    model: string;
}
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
            remarks: '',
        });
    }

    removeRow(index: number) {
        this.items.splice(index, 1);
    }

    assets: Array<{
        assetId: number;
        date_acquired: string;
        asset_barcode: string;
        brand: string;
        model: string;
    }> = [];

    assetList = [
        {
            id : 1,
            type: 'USB-C ADAPTER',
            date_acquired: '2021-06-02',
            asset_barcode: '000163',
            brand: 'APPLE',
            model: 'A2164',
        },
        {
            id: 2,
            type: 'KEYBOARD USB',
            date_acquired: '2014-01-11',
            asset_barcode: '01-01-03-000075-03',
            brand: 'DELL',
            model: 'KB216T',
        },
        {
            id: 3,
            type: 'MOUSE USB',
            date_acquired: '2014-01-11',
            asset_barcode: '01-01-03-000075-04',
            brand: 'DELL',
            model: 'MSIII-T',
        },
        {
            id: 4,
            type: 'MONITOR',
            date_acquired: '2023-02-14',
            asset_barcode: '01-01-09-004268-02',
            brand: 'N-VISION',
            model: 'N2755',
        },
        {
            id: 5,
            type: 'UPS',
            date_acquired: '2018-06-21',
            asset_barcode: '01-26-13-000025-01',
            brand: 'APC',
            model: 'BX625CI-MS',
        },     
    ];

    // Update fields when asset is selected
    onAssetSelect(selectedId: string, index: number) {
        const selectedAsset = this.assetList.find(asset => asset.id === Number(selectedId));
        if (selectedAsset) {
            this.assets[index] = {
                assetId: selectedAsset.id,
                date_acquired: selectedAsset.date_acquired,
                asset_barcode: selectedAsset.asset_barcode,
                brand: selectedAsset.brand,
                model: selectedAsset.model
            };
        }
    }
    addAccessoryRow() {
        this.assets.push({
            assetId: 0,
            date_acquired: '',
            asset_barcode: '',
            brand: '',
            model: ''
        });
    }

    removeAccessoryRow(index: number) {
        this.assets.splice(index, 1);
    }
}
