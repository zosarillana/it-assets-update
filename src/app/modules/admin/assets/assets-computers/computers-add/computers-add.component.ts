import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { AssetsService } from 'app/services/assets/assets.service';
import { ComponentsService } from 'app/services/components/components.service';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
// Add to your existing imports
import { FormArray } from '@angular/forms';
import { ComputerService } from 'app/services/computer/computer.service';
import { MatDialog } from '@angular/material/dialog';
import { ComputerComponentAddModalComponent } from './computer-component-add-modal/computer-component-add-modal.component';
import { CopmuterAssetsAddModalComponent } from './copmuter-assets-add-modal/copmuter-assets-add-modal.component';
import { AlertService } from 'app/services/alert.service';

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
    form: FormGroup;
    eventForm!: FormGroup;
    sortOrder = 'desc';
    private serialSubscription: Subscription;

    constructor(
        private _formBuilder: FormBuilder,
        private computerService: ComputerService,
        private getServiceComponents: ComponentsService,
        private getService: AssetsService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private alertService: AlertService
    ) {
        this.form = this._formBuilder.group({
            componentsArray: this._formBuilder.array([]), // Initialize as FormArray
        });
    }

    // Initialize form with comprehensive validation
    private initializeForm(): void {
        this.eventForm = this._formBuilder.group({
            image: [null],
            serial_number: [''],
            type: ['', [Validators.required]],
            asset_barcode: ['', [Validators.required]],
            date_acquired: ['', [Validators.required]],
            brand: ['', [Validators.required]],
            model: ['', [Validators.required]],
            size: ['', [Validators.required]],
            color: ['', [Validators.required]],
            po_number: ['', [Validators.required]],
            warranty: ['', [Validators.required]],
            cost: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
            components: this._formBuilder.array([]), // ADD THIS LINE
            assets: this._formBuilder.array([]), // Initialize accessories array
        });
        
        this.serialSubscription = this.eventForm
            .get('serial_number')!
            .valueChanges.pipe(distinctUntilChanged())
            .subscribe((value) => {
                this.cdr.detectChanges();
            });
    }

    ngOnInit(): void {
        this.initializeForm();
        // this.getAllComponents();
        // this.getAllAssets();
    }

    // Clean up subscription on component destroy
    ngOnDestroy(): void {
        if (this.serialSubscription) {
            this.serialSubscription.unsubscribe();
        }
    }

    validateNumber(event: KeyboardEvent) {
        const inputChar = event.key;
        if (!/^\d$/.test(inputChar) && inputChar !== 'Backspace' && inputChar !== 'Tab') {
            event.preventDefault();
        }
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
    assetControls: FormControl[] = [];
    filteredAssets: Observable<any[]>[] = [];

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

                        // Initialize autocomplete controls for each row
                        this.assetsArray.controls.forEach((_, index) => {
                            if (!this.assetControls[index]) {
                                this.assetControls[index] = new FormControl('');
                            }
                            this.filteredAssets[index] = this.assetControls[
                                index
                            ].valueChanges.pipe(
                                startWith(''),
                                map((searchValue) =>
                                    this.filterAssets(searchValue, index)
                                )
                            );
                        });

                        console.log('Filtered Assets:', this.assetList);
                    }
                },
                (error) => {
                    console.error('Error fetching assets:', error);
                }
            );
    }

    // getAllAssets(searchTerm: string = ''): void {
    //     const pageSize = 10000;
    //     let pageNumber = 1;

    //     this.getService
    //         .getAssets(pageNumber, pageSize, this.sortOrder, searchTerm)
    //         .subscribe(
    //             (response) => {
    //                 if (response && response.items && response.items.$values) {
    //                     this.assetList = response.items.$values.filter(
    //                         (asset) => asset.status === 'INACTIVE'
    //                     );
    //                     this.cdr.detectChanges();
    //                     console.log('Filtered Assets:', this.assetList);
    //                 }
    //             },
    //             (error) => {
    //                 console.error('Error fetching assets:', error);
    //             }
    //         );
    // }

    // onAssetSelect(selectedId: string, index: number) {
    //     const selectedAsset = this.assetList.find(
    //         (asset) => asset.id === Number(selectedId)
    //     );

    //     if (selectedAsset) {
    //         this.assetsArray.at(index).patchValue({
    //             assetId: selectedAsset.id,
    //             date_acquired: selectedAsset.date_acquired,
    //             asset_barcode: selectedAsset.asset_barcode,
    //             brand: selectedAsset.brand,
    //             model: selectedAsset.model,
    //         });
    //     }
    // }

    // Update your onAssetSelect function to include type:
    // onAssetSelect(selectedId: string, index: number) {
    //     const selectedAsset = this.assetList.find(
    //         (asset) => asset.id === Number(selectedId)
    //     );

    //     if (selectedAsset) {
    //         this.assetsArray.at(index).patchValue({
    //             assetId: selectedAsset.id,
    //             date_acquired: selectedAsset.date_acquired,
    //             asset_barcode: selectedAsset.asset_barcode,
    //             brand: selectedAsset.brand,
    //             model: selectedAsset.model,
    //             type: selectedAsset.type, // Add this line
    //         });
    //     }
    // }
    filterAssets(searchTerm: string, index: number) {
        if (!searchTerm) {
            return this.getFilteredAssets(index, null);
        }
        return this.getFilteredAssets(index, null).filter((asset) =>
            `${asset.brand} ${asset.model}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    }
    onAssetSelect(selectedId: string, index: number) {
        const selectedAsset = this.assetList.find(
            (asset) => asset.id === Number(selectedId)
        );
        if (selectedAsset) {
            this.assetsArray.at(index).patchValue({
                assetId: selectedAsset.id,
                date_acquired: selectedAsset.date_acquired,
                asset_barcode: selectedAsset.asset_barcode,
                brand: selectedAsset.brand,
                model: selectedAsset.model,
                type: selectedAsset.type,
            });
        }
    }
    addAccessoryRow() {
        const assetForm = this._formBuilder.group({
            assetId: [''],
            date_acquired: [''],
            asset_barcode: [''],
            brand: [''],
            type: [''],
            model: [''],
        });

        this.assetsArray.push(assetForm);
    }

    getFilteredAssets(index: number, selectedAssetId: number) {
        const selectedIds = this.assetsArray.controls
            .map((control) => control.value.assetId)
            .filter((id) => id !== 0 && id !== selectedAssetId); // Exclude empty selections

        return this.assetList.filter(
            (asset) =>
                asset.id === selectedAssetId || !selectedIds.includes(asset.id)
        );
    }

    get assetsArray() {
        return this.eventForm.get('assets') as FormArray;
    }

    removeAccessoryRow(index: number) {
        this.assetsArray.removeAt(index);
    }

    removeComponentsRow(index: number) {
        this.componentsArray.removeAt(index);
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

   
    //Old getFilteredComponents
    // getFilteredComponents(index: number, selectedComponentId: number) {
    //     const selectedIds = this.componentsArray.controls
    //         .map((control) => control.value.componentId)
    //         .filter((id) => id !== 0 && id !== selectedComponentId); // Exclude empty selections

    //     return this.componentList.filter(
    //         (component) =>
    //             component.id === selectedComponentId ||
    //             !selectedIds.includes(component.id)
    //     );
    // }
    //Old filling to options on Coponent Select
    // onComponentSelect(selectedId: string, index: number) {
    //     const selectedComponent = this.componentList.find(
    //         (component) => component.id === Number(selectedId)
    //     );

    //     if (selectedComponent) {
    //         console.log('Selected Component:', selectedComponent);
    //         console.log('Selected Component Type:', selectedComponent.type);

    //         // Patch the form to include type
    //         this.componentsArray.at(index).patchValue({
    //             componentId: selectedComponent.id,
    //             uid: selectedComponent.uid,
    //             description: selectedComponent.description,
    //             type: selectedComponent.type, // ✅ Ensure type is updated
    //             date_acquired: selectedComponent.date_acquired || 'Unknown',
    //         });

    //         // ✅ Force the form and UI to update
    //         this.eventForm.updateValueAndValidity();
    //         this.cdr.detectChanges();
    //     }
    // }

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

  

    // removeRow(index: number) {
    //     this.componentList.splice(index, 1);
    // }

    // get componentsArray() {
    //     return this.eventForm.get('components') as FormArray;
    // }

    //submitform
    // submitForm(): void {
    // Log the form values in a more readable format
    // console.log('Form Values:', {
    // Main form values
    // ...this.eventForm.value,
    // Get components array values
    // components: this.eventForm.get('components').value,
    // Get assets array values
    // assets: this.eventForm.get('assets').value
    // });

    // If you want to check if the form is valid
    // console.log('Form Valid:', this.eventForm.valid);

    // If you want to see specific validation errors
    // if (!this.eventForm.valid) {
    // console.log('Form Errors:', this.getFormValidationErrors());
    // }
    // }

    // Helper method to get validation errors
    // private getFormValidationErrors() {
    //     const errors = {};
    //     Object.keys(this.eventForm.controls).forEach(key => {
    //         const controlErrors = this.eventForm.get(key).errors;
    //         if (controlErrors != null) {
    //             errors[key] = controlErrors;
    //         }
    //     });
    //     return errors;
    // }

    // submitForm(): void {
    //     // Get the raw API response from the form
    //     const rawData = this.eventForm.value;
    //     console.log('Raw Form Data Before Mapping:', rawData);

    //     // Transform the response
    //     const mappedData = this.mapResponseToForm(rawData);

    //     // Log the mapped data before assigning it to the form
    //     console.log('Mapped Data Before Assigning to Form:', mappedData);

    //     // Update the form values
    //     this.eventForm.patchValue(mappedData);

    //     // Log the final form values after mapping
    //     console.log('Final Mapped Form Values:', this.eventForm.value);

    //     // Check if the form is valid
    //     console.log('Form Valid:', this.eventForm.valid);

    //     // Check if the form is valid before submission
    //     if (!this.eventForm.valid) {
    //         console.log('Form Errors:', this.getFormValidationErrors());
    //         return; // Stop submission if the form is invalid
    //     }

    //     // Call the API to submit the data
    //     this.computerService.postEvent(mappedData).subscribe({
    //         next: (response) => {
    //             console.log('API Response:', response);
    //             alert('Asset successfully added!'); // Notify the user
    //         },
    //         error: (error) => {
    //             console.error('API Error:', error);
    //             alert('Failed to add asset. Please try again.'); // Show error message
    //         },
    //     });
    // }

    // // **Mapping Function: Converts API response to FormGroup structure**
    // private mapResponseToForm(response: any): any {
    //     return {
    //         type: response.type || '',
    //         date_acquired: response.date_acquired?._d
    //             ? this.formatDate(response.date_acquired._d)
    //             : '',
    //         asset_barcode: response.asset_barcode || '',
    //         brand: response.brand || '',
    //         model: response.model || '',
    //         size: response.size || '',
    //         color: response.color || '',
    //         serial_no: response.serial_number || '',
    //         po: response.po_number || '',
    //         warranty: response.warranty || '',
    //         cost: response.cost || 0,
    //         remarks: response.remarks || '',
    
    //         // Mapping components properly
    //         components: response.components
    //             ? response.components.map((comp) => ({
    //                   date_acquired: comp.date_acquired || '',
    //                   type: comp.type || '',
    //                   description: comp.description || '',
    //               }))
    //             : [],
    
    //         // Mapping the asset structure
    //         asset: {
    //             type: response.type || '',
    //             date_acquired: response.date_acquired?._d
    //                 ? this.formatDate(response.date_acquired._d)
    //                 : '',
    //             asset_barcode: response.asset_barcode || '',
    //             brand: response.brand || '',
    //             model: response.model || '',
    //             size: response.size || '',
    //             color: response.color || '',
    //             serial_no: response.serial_number || '',
    //             po: response.po_number || '',
    //             warranty: response.warranty || '',
    //             cost: response.cost || 0,
    //             remarks: response.remarks || '',
    //         },
    //     };
    // }
    
    // submitForm(): void {
    //     // Get the raw API response from the form
    //     const rawData = this.eventForm.value;
    //     // console.log('Raw Form Data Before Mapping:', rawData);
      
    //     // Transform the response
    //     const mappedData = this.mapResponseToForm(rawData);
      
    //     // Log the mapped data before assigning it to the form
    //     // console.log('Mapped Data Before Assigning to Form:', mappedData);
      
    //     // Update the form values
    //     this.eventForm.patchValue(mappedData);
      
    //     // Log the final form values after mapping
    //     // console.log('Final Mapped Form Values:', this.eventForm.value);
      
    //     // Check if the form is valid
    //     // console.log('Form Valid:', this.eventForm.valid);
      
    //     if (!this.eventForm.valid) {
    //     //   console.log('Form Errors:', this.getFormValidationErrors());
    //       return; // Stop submission if the form is invalid
    //     }
      
    //     // Call the API to submit the data
    //     this.computerService.postEvent(mappedData).subscribe({
    //       next: (response) => {
    //         // console.log('API Response:', response);
    //         this.alertService.triggerSuccess('Asset successfully added!');
    //       },
    //       error: (error) => {
    //         // console.error('API Error:', error);
    //         this.alertService.triggerError('Failed to add asset. Please try again.');
    //       },
    //     });
    //   }
    submitForm(): void {
        // Get the raw API response from the form
        const rawData = this.eventForm.value;
      
        // Transform the response
        const mappedData = this.mapResponseToForm(rawData);
      
        // Update the form values
        this.eventForm.patchValue(mappedData);
      
        // Check if the form is valid
        if (!this.eventForm.valid) {
          return; // Stop submission if the form is invalid
        }
      
        // Call the API to submit the data
        this.computerService.postEvent(mappedData).subscribe({
          next: () => {
            this.alertService.triggerSuccess('Asset successfully added!');
            
            // ✅ Reload the page after success
            // setTimeout(() => {
            //   window.location.reload();
            // }, 1000); // Small delay for the alert to be visible
          },
          error: () => {
            this.alertService.triggerError('Failed to add asset. Please try again.');
          },
        });
      }
      
    
    private mapResponseToForm(response: any): any {
        return {
            type: response.type || '',
            date_acquired: response.date_acquired?._d
                ? this.formatDate(response.date_acquired._d)
                : response.date_acquired || '',
            asset_barcode: response.asset_barcode || '',
            brand: response.brand || '',
            model: response.model || '',
            size: response.size || '',
            color: response.color || '',
            serial_no: response.serial_number || '',
            po: response.po_number || '',
            warranty: response.warranty || '',
            cost: response.cost || 0,
            remarks: response.remarks || '',
    
            // ✅ Ensure components array is mapped correctly
            components: Array.isArray(response.components)
                ? response.components.map((comp) => ({
                    date_acquired: comp.date_acquired || '',
                    type: comp.type || '',
                    description: comp.description || '',
                }))
                : [],
    
            // ✅ Extract the first asset from the assets array (if available)
            asset: Array.isArray(response.assets) && response.assets.length > 0
                ? {
                    type: response.assets[0].type || '',
                    date_acquired: response.assets[0].date_acquired || '',
                    asset_barcode: response.assets[0].asset_barcode || '',
                    brand: response.assets[0].brand || '',
                    model: response.assets[0].model || '',
                    size: response.assets[0].size || '',
                    color: response.assets[0].color || '',
                    serial_no: response.assets[0].serial_number || '',
                    po: response.assets[0].po || '',
                    warranty: response.assets[0].warranty || '',
                    cost: response.assets[0].cost || 0,
                    remarks: response.assets[0].remarks || '',
                }
                : null, // ✅ If no assets, set asset to null
        };
    }
    
// **Helper function to get component description (e.g., SSD, HDD, GPU)**
private getComponentDescription(components: any[], type: string): string {
    const component = components?.find((c) => c.type === type);
    return component ? component.description : '';
}

  // **Helper function to format date to 'YYYY-MM-DD'**
private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

// **Helper method to get form validation errors**
private getFormValidationErrors(): any {
    const errors: any = {};
    Object.keys(this.eventForm.controls).forEach((key) => {
        const controlErrors = this.eventForm.get(key)?.errors;
        if (controlErrors) {
            errors[key] = controlErrors;
        }
    });
    return errors;
}

selectedComponent: string = '';
availableComponents: string[] = ['RAM', 'SSD', 'HDD', 'GPU', 'BOARD'];
get componentsArray(): FormArray {
    return this.eventForm.get('components') as FormArray;
}
onComponentSelect(event: Event, index: number) {
    const target = event.target as HTMLSelectElement;
    this.componentsArray
        .at(index)
        .patchValue({ componentId: target.value });
}
getSelectedComponents(): string[] {
    return this.componentsArray.controls
        .map((control) => control.value.componentId)
        .filter((value) => value); // Remove empty selections
}
getFilteredComponents(index: number): string[] {
    const selectedComponents = this.getSelectedComponents();
    return this.availableComponents.filter(
        (component) =>
            !selectedComponents.includes(component) ||
            component === this.componentsArray.at(index).value.componentId
    );
}
// **Open Modal to Add Component**
openComponentAdd() {


    const serialNumber = this.eventForm.get('serial_number')?.value; // Get the current serial number
    const assetBarcode = this.eventForm.get('asset_barcode')?.value; // Get the current serial number

    const dialogRef = this.dialog.open(ComputerComponentAddModalComponent, {
        width: '700px',
        disableClose: true,
        data: { serial_number: serialNumber, asset_barcode: assetBarcode }, // Pass the serial number
    });

    dialogRef.afterClosed().subscribe((result) => {
        console.log("Component Modal Result:", result);
        if (result) {
            this.addComponent(result);
        }
    });   
}

// **Add Component to Form**
addComponent(componentData: any) {
    this.componentsArray.push(
        this._formBuilder.group({
            asset_barcode: [componentData.asset_barcode],
            date_acquired: [componentData.date_acquired],
            type: [componentData.type, Validators.required],
            description: [componentData.description, Validators.required],
        })
    );

    console.log("Updated Components Array:", this.componentsArray.value);
}

addRow() {
    const componentForm = this._formBuilder.group({
        componentId: [''],
        asset_barcode:[''],
        uid: [''],
        description: [''],
        type: [''], // ✅ Add type here
        date_acquired: [''],
    });

    this.componentsArray.push(componentForm);
}

// **Remove Component from Form**
removeComponent(index: number) {
    this.componentsArray.removeAt(index);
}

openAssetsAdd() {
    const serialNumber = this.eventForm.get('serial_number')?.value;

    const dialogRef = this.dialog.open(CopmuterAssetsAddModalComponent, {
        width: '700px',
        disableClose: true,
        data: { serial_number: serialNumber },
    });

    dialogRef.afterClosed().subscribe((result) => {
        if (result) {
            console.log("Received Asset Data:", result);
            this.addAssets(result); // ✅ Add modal data to the form
        }
    });
}

    // openAssetsAdd() {
    //     const serialNumber = this.eventForm.get('serial_number')?.value; // Get the current serial number

    //     const dialogRef = this.dialog.open(CopmuterAssetsAddModalComponent, {
    //         width: '700px',
    //         disableClose: true,
    //         data: { serial_number: serialNumber }, // Pass the serial number
    //     });

    //     dialogRef.afterClosed().subscribe((result) => {
    //         if (result) {
    //             this.addAssets(result);
    //         }
    //     });
    // }

    addAssets(assetData: any) {
        this.assetsArray.push(
            this._formBuilder.group({
                type: [assetData.type, Validators.required],
                serial_number: [assetData.serial_number, Validators.required],
                asset_barcode: [assetData.asset_barcode, Validators.required],
                date_acquired: [assetData.date_acquired, Validators.required],
                brand: [assetData.brand, Validators.required],
                model: [assetData.model, Validators.required],
                cost: [Number(assetData.cost) || 0, Validators.required], // Convert to number
            })
        );
    
        console.log("Updated Assets Array:", this.assetsArray.value);
    }
    

    removeRow(index: number) {
        this.componentsArray.removeAt(index);
    }
}
