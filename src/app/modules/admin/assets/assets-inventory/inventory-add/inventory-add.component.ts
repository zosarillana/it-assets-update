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
        private computerService: ComputerService,
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
        // Get the raw API response from the form
        const rawData = this.eventForm.value;
        console.log('Raw Form Data Before Mapping:', rawData);

        // Transform the response
        const mappedData = this.mapResponseToForm(rawData);

        // Log the mapped data before assigning it to the form
        console.log('Mapped Data Before Assigning to Form:', mappedData);

        // Update the form values
        this.eventForm.patchValue(mappedData);

        // Log the final form values after mapping
        console.log('Final Mapped Form Values:', this.eventForm.value);

        // Check if the form is valid
        console.log('Form Valid:', this.eventForm.valid);

        // Check if the form is valid before submission
        if (!this.eventForm.valid) {
            console.log('Form Errors:', this.getFormValidationErrors());
            return; // Stop submission if the form is invalid
        }

        // Call the API to submit the data
        this.computerService.postEvent(mappedData).subscribe({
            next: (response) => {
                console.log('API Response:', response);
                alert('Asset successfully added!'); // Notify the user
            },
            error: (error) => {
                console.error('API Error:', error);
                alert('Failed to add asset. Please try again.'); // Show error message
            },
        });
    }

    // **Mapping Function: Converts API response to FormGroup structure**
    private mapResponseToForm(response: any): any {
        return {
            // user_name: '',
            // company: '',
            // department: '',
            // employee_id: '',
            type: '',
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
            cost: 0,
            remarks: '',
            // li_description: response.components
            //     ? response.components.map((c) => c.description).join(', ')
            //     : '',
            // owner_id: 0,
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
