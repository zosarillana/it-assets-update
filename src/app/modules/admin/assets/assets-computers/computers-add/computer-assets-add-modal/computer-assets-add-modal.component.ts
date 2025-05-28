import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { AlertService } from 'app/services/alert.service';
import { ComponentsService } from 'app/services/components/components.service';
import { Observable } from 'rxjs';
import { ComputerComponentAddModalComponent } from '../computer-component-add-modal/computer-component-add-modal.component';
import { PeripheralService } from 'app/services/peripheral/peripheral.service';

@Component({
  selector: 'app-computer-assets-add-modal',
  templateUrl: './computer-assets-add-modal.component.html',
  styleUrls: ['./computer-assets-add-modal.component.scss']
})
export class CopmuterAssetsAddModalComponent implements OnInit {
    eventForm!: FormGroup;
    imageUrl: SafeUrl =
        'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
    selectedFile: File | null = null;
    errorMessage$: Observable<string | null> = this.alertService.error$;
    warrantyOptions: { label: string; value: string }[] = [];
    peripheralOptions: any[] = [];

    
    constructor(
        private dialogRef: MatDialogRef<ComputerComponentAddModalComponent>,
        private _formBuilder: FormBuilder,
        private service: ComponentsService,
        private alertService: AlertService,
        private sanitizer: DomSanitizer,
        private Peripheralservice: PeripheralService,
        @Inject(MAT_DIALOG_DATA) public data: any // Inject the passed data
    ) {}

    ngOnInit(): void {
        // console.log(this.data.po);
        
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

        this.Peripheralservice.getPeripherals().subscribe({
            next: (res: any[]) => {
              this.peripheralOptions = res;
            },
            
          });
          
    }

    private initializeForm(): void {
        this.eventForm = this._formBuilder.group({
            image_component: [null],
            serial_number: [this.data.asset?.serial_number || this.data.serial_number || '', [Validators.required]], // ✅ Use passed value
            asset_barcode: [this.data.asset?.asset_barcode || '', [Validators.required]],
            // date_acquired: [this.data.asset?.date_acquired ? new Date(this.data.asset.date_acquired) : new Date(), [Validators.required]], // ✅ Convert to Date object if editing
            date_acquired: [this.data.asset?.date_acquired || this.data.date_acquired || new Date(), [Validators.required]],
            type: [this.data.asset?.type || '', [Validators.required]],
            po: [this.data.asset?.po || this.data.po || '', [Validators.required]],
            brand: [this.data.asset?.brand || '', [Validators.required]],
            model: [this.data.asset?.model || '', [Validators.required]],
            warranty: [this.data.asset?.warranty || this.data.warranty || '',],
            cost: [Number(this.data.asset?.cost) || 0, [Validators.required, Validators.pattern("^[0-9]*$")]], // ✅ Ensure cost is a number
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

    validateNumber(event: KeyboardEvent) {
        const inputChar = event.key;
        if (!/^\d$/.test(inputChar) && inputChar !== 'Backspace' && inputChar !== 'Tab') {
            event.preventDefault();
        }
    }

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
        this.eventForm.reset({}, { emitEvent: false });
        this.eventForm.patchValue({ serial_number: serialNumber });
        // Reset image preview
        this.imageUrl =
            'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';
        this.selectedFile = null;
    }

    close() {
        this.dialogRef.close();
    }
}
