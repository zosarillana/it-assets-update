import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'app/services/alert.service';
import { ComponentsService } from 'app/services/components/components.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';

@Component({
    selector: 'app-computer-component-add-modal',
    templateUrl: './computer-component-add-modal.component.html',
    styleUrls: ['./computer-component-add-modal.component.scss'],
})
export class ComputerComponentAddModalComponent implements OnInit {
    eventForm!: FormGroup;
    imageUrl: SafeUrl =
        'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
    selectedFile: File | null = null;
    errorMessage$: Observable<string | null> = this.alertService.error$;
    warrantyOptions: { label: string; value: string }[] = [];

    constructor(
        private dialogRef: MatDialogRef<ComputerComponentAddModalComponent>,
        private _formBuilder: FormBuilder,
        private service: ComponentsService,
        private alertService: AlertService,
        private sanitizer: DomSanitizer,
        @Inject(MAT_DIALOG_DATA) public data: any // Inject the passed data
    ) {}

    ngOnInit(): void {
        // console.log(this.data.serial_number);
        this.initializeForm();

        const now = new Date();
        for (let i = 1; i <= 12; i++) {
            const futureDate = new Date(
                now.getFullYear(),
                now.getMonth() + i,
                now.getDate()
            );
            const monthYear = futureDate.toLocaleString('default', {
                month: 'short',
                year: 'numeric',
            });

            this.warrantyOptions.push({
                label: `${i} month${i > 1 ? 's' : ''} (until ${monthYear})`,
                value: `${i}`,
            });
        }
    }

    // private initializeForm(): void {
    //     this.eventForm = this._formBuilder.group({
    //         image_component: [null],
    //         serial_number: [this.data.serial_number || 'N/A', []], // Use the passed value
    //         asset_barcode: [this.data.asset_barcode || 'N/A', []], // Use the passed value
    //         date_acquired: [new Date(), [Validators.required]],
    //         type: ['', [Validators.required]],
    //         description: ['', [Validators.required]],
    //     });
    // }
    private initializeForm(): void {
        this.eventForm = this._formBuilder.group({
            image_component: [null],
            serial_number: [this.data.serial_number || '', [Validators.required]], // Use the passed value
            asset_barcode: [this.data.asset_barcode || '', [Validators.required]], // Use existing data
            // date_acquired: [this.data.component?.date_acquired || new Date(), [Validators.required]],
            date_acquired: [this.data.component?.date_acquired ? new Date(this.data.component.date_acquired) : new Date(), [Validators.required]], // ✅ Convert to Date object if editing
            type: [this.data.component?.type || '', [Validators.required]],
            warranty: [this.data.asset?.warranty || this.data.warranty || '', [Validators.required]],
            
            // cost: [Number(this.data.asset?.cost) || 0, [Validators.required, Validators.pattern("^[0-9]*$")]], // ✅ Ensure cost is a number
            description: [this.data.component?.description || '', [Validators.required]],
        });
    }
    

    previewSelectedImageComponent(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = (e: ProgressEvent<FileReader>) => {
                const previewImageComponent = document.getElementById(
                    'preview-image-component'
                ) as HTMLImageElement;
                if (previewImageComponent) {
                    previewImageComponent.src = e.target?.result as string;
                }
            };

            reader.readAsDataURL(file);
        }
    }

    // submit() {
    //     if (this.eventForm.valid) {

    //       this.dialogRef.close(this.eventForm.value); // Pass data back to parent
    //     }
    // }

    submit() {
        if (this.eventForm.valid) {
            const formData = { ...this.eventForm.value };

            // Convert date to MM/DD/YYYY format
            formData.date_acquired = formatDate(
                formData.date_acquired,
                'MM/dd/yyyy',
                'en-US'
            );

            this.dialogRef.close(formData);
        }
    }

    resetForm() {
        const serialNumber = this.eventForm.get('serial_number')?.value;
        const AssetBarcode = this.eventForm.get('asset_barcode')?.value;
        this.eventForm.reset({}, { emitEvent: false });
        this.eventForm.patchValue({ serial_number: serialNumber });
        this.eventForm.patchValue({ asset_barcode: AssetBarcode });
        // Reset image preview
        this.imageUrl =
            'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
        this.selectedFile = null;
    }

    close() {
        this.dialogRef.close();
    }

    
}
