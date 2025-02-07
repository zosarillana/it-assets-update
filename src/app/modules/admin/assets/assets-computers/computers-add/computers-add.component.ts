import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AssetsService } from 'app/services/assets/assets.service';
import { ComponentsService } from 'app/services/components/components.service';

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
    // items: any[] = []; // Stores rows
    sortOrder = 'desc'; // Sort order (can be changed dynamically)

    constructor(
        private getServiceComponents: ComponentsService,
        private getService: AssetsService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.getAllComponents();      
        // Example: Fetch the first page with a page size of 10, sorted by date in descending order
        this.getAllAssets();
        this.assets = [
            {
                assetId: 0,
                date_acquired: '',
                asset_barcode: '',
                brand: '',
                model: '',
            },
        ];
    }

    getFilteredAssets(index: number, selectedAssetId: number) {
        return this.assetList.filter(
            (asset) =>
                asset.id === selectedAssetId || // Include the currently selected asset
                !this.assets.some((selected) => selected.assetId === asset.id) // Filter out already selected ones
        );
    }

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

    assets: Array<{
        assetId: number;
        date_acquired: string;
        asset_barcode: string;
        brand: string;
        model: string;
    }> = [];

    assetList = [];

    // Method to fetch all assets with a large page size
    getAllAssets(searchTerm: string = ''): void {
        const pageSize = 10000;
        let pageNumber = 1;

        this.getService
            .getAssets(pageNumber, pageSize, this.sortOrder, searchTerm)
            .subscribe(
                (response) => {
                    if (response && response.items && response.items.$values) {
                        this.assetList = response.items.$values.filter(
                            (asset) => asset.status === 'INACTIVE'
                        );
                        this.cdr.detectChanges();
                        console.log('Filtered Assets:', this.assetList);
                    }
                },
                (error) => {
                    console.error('Error fetching assets:', error);
                }
            );
    }

    // getFilteredAssets(index: number, selectedAssetId: number) {
    //     return this.assetList.filter(
    //         (asset) =>
    //             asset.id === selectedAssetId || // Include the currently selected asset
    //             !this.assets.some((selected) => selected.assetId === asset.id) // Filter out already selected ones
    //     );
    // }

    onAssetSelect(selectedId: string, index: number) {
        const selectedAsset = this.assetList.find(
            (asset) => asset.id === Number(selectedId)
        );
        if (selectedAsset) {
            this.assets[index] = {
                assetId: selectedAsset.id,
                date_acquired: selectedAsset.date_acquired,
                asset_barcode: selectedAsset.asset_barcode,
                brand: selectedAsset.brand,
                model: selectedAsset.model,
            };
        }
    }

    addAccessoryRow() {
        this.assets.push({
            assetId: 0,
            date_acquired: '',
            asset_barcode: '',
            brand: '',
            model: '',
        });
    }

    removeAccessoryRow(index: number) {
        this.assets.splice(index, 1);
    }

    //components select
    components: Array<{
        componentId: number;
        asset_barcode: number;
        type: string;
        description: string;
        uid: string;
        status: string;
        date_acquired?: string; // Optional       
    }> = [];

    componentList: any[] = []; // Stores all components fetched from API    

    getAllComponents(searchTerm: string = ''): void {
        const pageSize = 10000;
        let pageNumber = 1;

        this.getServiceComponents
            .getComponents(pageNumber, pageSize, this.sortOrder, searchTerm)
            .subscribe(
                (response) => {
                    if (response && response.items && response.items.$values) {
                        this.componentList = response.items.$values.filter(
                            (component) => component.status === 'INACTIVE'
                        );
                        this.cdr.detectChanges();
                        console.log('Filtered Components:', this.componentList);
                    }
                },
                (error) => {
                    console.error('Error fetching Components:', error);
                }
            );
    }

    onComponentSelect(selectedId: string, index: number) {
        if (!this.components[index]) {
            this.components[index] = {} as any; // Ensure it's initialized
        }

        const selectedComponent = this.componentList.find(
            (component) => component.id === Number(selectedId)
        );

        if (selectedComponent) {
            this.components[index] = {
                componentId: selectedComponent.id,
                type: selectedComponent.type,
                description: selectedComponent.description,
                asset_barcode: selectedComponent.asset_barcode,
                uid: selectedComponent.uid,
                status: selectedComponent.status,
                date_acquired: selectedComponent.date_acquired || 'Unknown',               
            };
        }
    }

    getFilteredComponents(index: number, selectedComponentId: number) {
        return this.componentList.filter(
            (component) =>
                component.id === selectedComponentId || // Keep selected component
                !this.components.some(
                    (selected) => selected.componentId === component.id
                ) // Exclude already selected ones
        );
    }

    addRow() {
        this.components.push({
            componentId: 0,
            asset_barcode: 0,
            type: '',
            description: '',
            uid: '',
            status: '',
            date_acquired: ''        
        });
    }

    removeRow(index: number) {
        this.componentList.splice(index, 1);
    }
}
