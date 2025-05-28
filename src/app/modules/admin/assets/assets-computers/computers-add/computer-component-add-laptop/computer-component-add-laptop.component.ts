import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { AlertService } from 'app/services/alert.service';
import { ComponentsService } from 'app/services/components/components.service';
import { Observable } from 'rxjs';
import { ComputerComponentAddModalComponent } from '../computer-component-add-modal/computer-component-add-modal.component';

@Component({
    selector: 'app-computer-component-add-laptop',
    templateUrl: './computer-component-add-laptop.component.html',
    styleUrls: ['./computer-component-add-laptop.component.scss'],
})
export class ComputerComponentAddLaptopComponent implements OnInit {
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
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit(): void {
        this.initializeForm();

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

    private initializeForm(): void {
        this.eventForm = this._formBuilder.group({
            image_component: [null],
            serial_number: [
                this.data.serial_number || '',
            ],
            asset_barcode: [
                this.data.asset_barcode || '',
                [Validators.required],
            ],
            date_acquired: [
                this.data.component?.date_acquired
                    ? new Date(this.data.component.date_acquired)
                    : new Date(),
                [Validators.required],
            ],
            type: [this.data.component?.type || '', [Validators.required]],
            description: [
                this.data.component?.description || '',
                [Validators.required],
            ],
            warranty: [
                this.data.component?.warranty || ''
             
            ],
        });
    }

    previewSelectedImageComponent(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.selectedFile = file;
            // Set the file in the form control (even if not required)
            this.eventForm.get('image_component')?.setValue(file);

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

    submit() {
        if (this.eventForm.valid) {
            const formData = { ...this.eventForm.value };

            formData.uid = formData.asset_barcode;
            formData.warranty = formData.warranty || '';
            formData.date_acquired = formatDate(
                formData.date_acquired,
                'MM/dd/yyyy',
                'en-US'
            );

            this.dialogRef.close(formData);
        } else {
            // Mark all as touched to show errors
            this.eventForm.markAllAsTouched();
        }
    }

    resetForm() {
        const serialNumber = this.eventForm.get('serial_number')?.value;
        const assetBarcode = this.eventForm.get('asset_barcode')?.value;
        this.eventForm.reset({}, { emitEvent: false });
        this.eventForm.patchValue({ serial_number: serialNumber });
        this.eventForm.patchValue({ asset_barcode: assetBarcode });
        this.imageUrl =
            'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
        this.selectedFile = null;
    }

    close() {
        this.dialogRef.close();
    }
}