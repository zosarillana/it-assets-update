import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssetsService } from 'app/services/assets/assets.service';
import { ComponentsService } from 'app/services/components/components.service';
import { ComputerService } from 'app/services/computer/computer.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-add-inventory',
    templateUrl: './inventory-add.component.html',
    styleUrls: ['./inventory-add.component.scss'],
})
export class InventoryAddComponent implements OnInit {
    eventForm!: FormGroup;
    private serialSubscription: Subscription;
    constructor(
        private _formBuilder: FormBuilder,
        private assetService: AssetsService,
        private getServiceComponents: ComponentsService,
        private getService: AssetsService,
        private cdr: ChangeDetectorRef
    ) {}

    // Initialize form with comprehensive validation
    private initializeForm(): void {
        this.eventForm = this._formBuilder.group({
            image: [null],          
            serial_number: ['', Validators.required],
            type: ['', [Validators.required]],
            asset_barcode: ['', [Validators.required]],
            date_acquired: ['', [Validators.required]],
            brand: ['', [Validators.required]],
            model: ['', [Validators.required]],
            po_number: ['', [Validators.required]],
            warranty: ['', [Validators.required]],
            remarks: ['', [Validators.required]],
            cost: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.initializeForm();
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

    submitForm(): void {
        // Validate the form before processing
        if (this.eventForm.invalid) {
            console.log('Form Errors:', this.getFormValidationErrors());
            alert('Please fill in all required fields.');
            return;
        }
    
        // Get raw form data
        const rawData = this.eventForm.value;
        console.log('Raw Form Data Before Mapping:', rawData);
    
        // Transform form data to API format
        const mappedData = this.mapResponseToForm(rawData);
        console.log('Mapped Data Before Assigning to Form:', mappedData);
    
        // Update form values to ensure correct structure
        this.eventForm.patchValue(mappedData);
        console.log('Final Mapped Form Values:', this.eventForm.value);
    
        // Submit data to the API
        this.assetService.postEvent(mappedData).subscribe({
            next: (response) => {
                console.log('API Response:', response);
                alert('Asset successfully added!'); 
                this.eventForm.reset(); // Reset form after success
            },
            error: (error) => {
                console.error('API Error:', error);
                alert('Failed to add asset. Please try again.');
            },
        });
    }
    

    // **Mapping Function: Converts API response to FormGroup structure**
    private mapResponseToForm(response: any): any {
        return {
            type: response.type || '',  // Keep the original type value
            date_acquired: response.date_acquired?._d
                ? this.formatDate(response.date_acquired._d)
                : '',
            asset_barcode: response.asset_barcode || '',
            brand: response.brand || '',
            model: response.model || '',
            color: response.color || '',
            serial_no: response.serial_number || '',
            po: response.po_number || '',
            warranty: response.warranty || '',
            cost: response.cost,
            remarks: response.remarks,
            asset_image: '',
            gpu: '',
            hdd: '',
            li_description: '',
            ram: '',
            size: '', 
            ssd: ''
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
}
