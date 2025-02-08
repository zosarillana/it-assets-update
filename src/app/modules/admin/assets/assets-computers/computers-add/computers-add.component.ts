import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AssetsService } from 'app/services/assets/assets.service';
import { ComponentsService } from 'app/services/components/components.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
// Add to your existing imports
import { FormArray } from '@angular/forms';


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
    eventForm!: FormGroup;
    sortOrder = 'desc';
    private serialSubscription: Subscription;
    
    constructor(
        private _formBuilder: FormBuilder,
        private getServiceComponents: ComponentsService,
        private getService: AssetsService,
        private cdr: ChangeDetectorRef
    ) {}

    // Initialize form with comprehensive validation
    private initializeForm(): void {
        this.eventForm = this._formBuilder.group({
            image: [null],
            serial_number: [''],
            type: ['', [Validators.required]],
            date_acquired: ['', [Validators.required]],
            brand: ['', [Validators.required]],
            model: ['', [Validators.required]],
            size: ['', [Validators.required]],
            color: ['', [Validators.required]],
            po_number: ['', [Validators.required]],
            warranty: ['', [Validators.required]],  
            components: this._formBuilder.array([]), // ADD THIS LINE
            assets: this._formBuilder.array([]) // Initialize accessories array
        });   
    
        this.serialSubscription = this.eventForm.get('serial_number')!.valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(value => {
                this.cdr.detectChanges();
            });    
    }
    

    ngOnInit(): void {
        this.initializeForm();
        this.getAllComponents();
        // Example: Fetch the first page with a page size of 10, sorted by date in descending order
        this.getAllAssets();
    }

      // Clean up subscription on component destroy
      ngOnDestroy(): void {
        if (this.serialSubscription) {
            this.serialSubscription.unsubscribe();
        }
    }

    // getFilteredAssets(index: number, selectedAssetId: number) {
    //     return this.assetList.filter(
    //         (asset) =>
    //             asset.id === selectedAssetId || // Include the currently selected asset
    //             !this.assets.some((selected) => selected.assetId === asset.id) // Filter out already selected ones
    //     );
    // }

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

    // onAssetSelect(selectedId: string, index: number) {
    //     const selectedAsset = this.assetList.find(
    //         (asset) => asset.id === Number(selectedId)
    //     );
    //     if (selectedAsset) {
    //         this.assets[index] = {
    //             assetId: selectedAsset.id,
    //             date_acquired: selectedAsset.date_acquired,
    //             asset_barcode: selectedAsset.asset_barcode,
    //             brand: selectedAsset.brand,
    //             model: selectedAsset.model,
    //         };
    //     }
    // }

    onAssetSelect(selectedId: string, index: number) {
        const selectedAsset = this.assetList.find(asset => asset.id === Number(selectedId));
    
        if (selectedAsset) {
            this.assetsArray.at(index).patchValue({
                assetId: selectedAsset.id,
                date_acquired: selectedAsset.date_acquired,
                asset_barcode: selectedAsset.asset_barcode,
                brand: selectedAsset.brand,
                model: selectedAsset.model
            });
        }
    }
    
    

    addAccessoryRow() {
        const assetForm = this._formBuilder.group({
            assetId: [''],
            date_acquired: [''],
            asset_barcode: [''],
            brand: [''],
            model: ['']
        });
    
        this.assetsArray.push(assetForm);
    }
    
    getFilteredAssets(index: number, selectedAssetId: number) {
        const selectedIds = this.assetsArray.controls
            .map(control => control.value.assetId)
            .filter(id => id !== 0 && id !== selectedAssetId); // Exclude empty selections
    
        return this.assetList.filter(
            asset => asset.id === selectedAssetId || !selectedIds.includes(asset.id)
        );
    }
    
    // Inside your component class
    get assetsArray() {
        return this.eventForm.get('assets') as FormArray;
    }
    // get accessoriesArray() {
    //     return this.eventForm.get('accessories') as FormArray;
    // }
    
    // removeAccessoryRow(index: number) {
    //     this.assets.splice(index, 1);
    // }
    removeAccessoryRow(index: number) {
        this.assetsArray.removeAt(index);
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
        const selectedComponent = this.componentList.find(component => component.id === Number(selectedId));
    
        if (selectedComponent) {
            this.componentsArray.at(index).patchValue({
                componentId: selectedComponent.id,
                uid: selectedComponent.uid,
                description: selectedComponent.description,
                date_acquired: selectedComponent.date_acquired || 'Unknown'
            });
        }
    }
    

    getFilteredComponents(index: number, selectedComponentId: number) {
        const selectedIds = this.componentsArray.controls
            .map(control => control.value.componentId)
            .filter(id => id !== 0 && id !== selectedComponentId); // Exclude empty selections
    
        return this.componentList.filter(
            component => component.id === selectedComponentId || !selectedIds.includes(component.id)
        );
    }

    
    // addRow() {
    //     this.components.push({
    //         componentId: 0,
    //         asset_barcode: 0,
    //         type: '',
    //         description: '',
    //         uid: '',
    //         status: '',
    //         date_acquired: '',
    //     });
    // }

    addRow() {
        const componentForm = this._formBuilder.group({
            componentId: [''],
            uid: [''],
            description: [''],
            date_acquired: ['']
        });
    
        this.componentsArray.push(componentForm);
    }

    
    // removeRow(index: number) {
    //     this.componentList.splice(index, 1);
    // }

    removeRow(index: number) {
        this.componentsArray.removeAt(index);
    }

    
    get componentsArray() {
        return this.eventForm.get('components') as FormArray;
    }
    
    //submitform
    submitForm(): void {
       console.log(this.eventForm);           
    }
}
