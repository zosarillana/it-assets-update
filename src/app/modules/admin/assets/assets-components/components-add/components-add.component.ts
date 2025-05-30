import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
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
    warrantyOptions: { label: string; value: string }[] = [];
    constructor(
        private _formBuilder: FormBuilder,
        private service: ComponentsService,
        private alertService: AlertService,
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    // Initialize form with comprehensive validation
    private initializeForm(): void {
        this.eventForm = this._formBuilder.group({
            serial_number: ['', [Validators.required]],
            cost: [0, [Validators.required, Validators.pattern('^[0-9]*$')]], 
            type: ['', [Validators.required]],
            description: ['', [Validators.required]],
            warranty: [''],
            date_acquired: [new Date(), [Validators.required]],
            uid: [''] // Added UID field
        });

        // Subscribe to changes in serial_number to update the UID field
        this.eventForm.get('serial_number').valueChanges.subscribe((value) => {
            if (value) {
                this.eventForm.patchValue({ uid: value }, { emitEvent: false });
            }
        });
    }

    ngOnInit(): void {
        this.initializeForm(); // Initialize the form properly

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

        validateNumber(event: KeyboardEvent) {
        const inputChar = event.key;
        if (
            !/^\d$/.test(inputChar) &&
            inputChar !== 'Backspace' &&
            inputChar !== 'Tab'
        ) {
            event.preventDefault();
        }
    }

    
    submitForm(): void {
        if (this.eventForm.invalid) {
            this.alertService.triggerError(
                'Please fill in all required fields.'
            );
            return;
        }
    
        // Ensure UID is set to match serial_number before submitting
        const formData = {
            ...this.eventForm.value,
            uid: this.eventForm.get('serial_number').value
        };

        this.service.postEvent(formData).subscribe({
            next: (response) => {
                // console.log('Upload successful:', response);
                this.alertService.triggerSuccess('Upload successful!');

                // Reload the page after success
                // setTimeout(() => {
                //     window.location.reload();
                // }, 1000); // Small delay to let the alert show

                console.log('Submitting with data:', formData); // For debugging
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
        this.eventForm.patchValue({ 
            serial_number: serialNumber,
            uid: serialNumber // Also restore UID to match serial_number
        }); 
    }

    //drawer
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    currentStep: number = 0;
    @ViewChild('courseSteps', { static: true }) courseSteps: MatTabGroup;

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    goToStep(step: number): void {
        // Set the current step
        this.currentStep = step;

        // Go to the step
        this.courseSteps.selectedIndex = this.currentStep;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Go to previous step
     */
    goToPreviousStep(): void {
        // Return if we already on the first step
        if (this.currentStep === 0) {
            return;
        }

        // Go to step
        this.goToStep(this.currentStep - 1);

        // Scroll the current step selector from sidenav into view
        this._scrollCurrentStepElementIntoView();
    }

    /**
     * Scrolls the current step element from
     * sidenav into the view. This only happens when
     * previous/next buttons pressed as we don't want
     * to change the scroll position of the sidebar
     * when the user actually clicks around the sidebar.
     *
     * @private
     */
    private _scrollCurrentStepElementIntoView(): void {
        // Wrap everything into setTimeout so we can make sure that the 'current-step' class points to correct element
        setTimeout(() => {
            // Get the current step element and scroll it into view
            const currentStepElement =
                this._document.getElementsByClassName('current-step')[0];
            if (currentStepElement) {
                currentStepElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        });
    }
}