import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'app/services/alert.service';
import { ComponentsService } from 'app/services/components/components.service';

@Component({
    selector: 'app-components-add',
    templateUrl: './components-add.component.html',
    styleUrls: ['./components-add.component.scss'],
})
export class ComponentsAddComponent implements OnInit {
    // Form group declaration
    eventForm!: FormGroup;
    constructor(private _formBuilder: FormBuilder, 
        private service: ComponentsService,         
        private alertService: AlertService) {}

    // Initialize form with comprehensive validation
    private initializeForm(): void {
        this.eventForm = this._formBuilder.group({
            serial_number: ['N/A', []],
            cost: [ 0, [Validators.required, Validators.pattern("^[0-9]*$")]], // ✅ Ensure cos
            type: ['', [Validators.required]],
            description: ['', [Validators.required]],          
        });
    }

    ngOnInit(): void {
        this.initializeForm(); // Initialize the form properly
    }

    submitForm(): void {
        if (this.eventForm.invalid) {
          this.alertService.triggerError('Please fill in all required fields.');
          return;
        }
      
        this.service.postEvent(this.eventForm.value).subscribe({
          next: (response) => {
            console.log('Upload successful:', response);
            this.alertService.triggerSuccess('Upload successful!');
      
            // ✅ Reload the page after success
            setTimeout(() => {
              window.location.reload();
            }, 1000); // Small delay to let the alert show
          },
          error: (error) => {
            console.error('Upload failed:', error);
            console.error('Error response:', error.error);
            this.alertService.triggerError(
              error.error?.message || 'Upload failed. Please try again.'
            );
          },
        });
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

    resetForm() {
        const serialNumber = this.eventForm.get('serial_number')?.value; // Save the current serial_number value
        this.eventForm.reset({}, { emitEvent: false }); // Reset the form without triggering validation events
        this.eventForm.patchValue({ serial_number: serialNumber }); // Restore the serial_number value
    }
      
}
