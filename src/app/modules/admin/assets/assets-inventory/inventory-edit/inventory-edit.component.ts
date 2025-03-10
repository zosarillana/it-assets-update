import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AlertService } from 'app/services/alert.service';
import { AssetsService } from 'app/services/assets/assets.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Location } from '@angular/common';

@Component({
    selector: 'app-edit-inventory',
    templateUrl: './inventory-edit.component.html',
    styleUrls: ['./inventory-edit.component.scss'],
})
export class InventoryEditComponent implements OnInit {
    asset!: Assets;
    eventForm!: FormGroup;
    private serialSubscription: Subscription;
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef,
        private route: ActivatedRoute,
        private assetsService: AssetsService,
        private _formBuilder: FormBuilder,
        private cdr: ChangeDetectorRef,
        private alertService: AlertService,
        private location: Location
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.assetsService.getAssetById(id).subscribe({
                next: (data) => {
                    this.asset = data;
                    this.initializeForm(); // Initialize form AFTER you have the data
                    this.cdr.detectChanges(); // Trigger change detection
                },
                error: (err) => console.error('Error fetching asset', err),
            });
        } else {
            // If no ID, initialize form with empty values
            this.initializeForm();
        }
    }
    
    goBack(): void {
        this.location.back();
      }

    private initializeForm(): void {
        // Parse the date string into a Date object
        let dateAcquired = null;
        if (this.asset?.date_acquired) {
            // Parse the MM/DD/YYYY format into a Date object
            const dateParts = this.asset.date_acquired.split('/');
            if (dateParts.length === 3) {
                // Month is 0-indexed in JavaScript Date
                dateAcquired = new Date(
                    parseInt(dateParts[2]), // Year
                    parseInt(dateParts[0]) - 1, // Month (0-indexed)
                    parseInt(dateParts[1]) // Day
                );
            }
        }

        this.eventForm = this._formBuilder.group({
            image: [null],
            serial_number: [
                this.asset?.serial_no || 'N/A',
                Validators.required,
            ],
            type: [this.asset?.type || 'N/A', [Validators.required]],
            asset_barcode: [
                this.asset?.asset_barcode || '',
                [Validators.required],
            ],
            date_acquired: [this.asset?.date_acquired || 'N/A', [Validators.required]],
            brand: [this.asset?.brand || 'N/A', [Validators.required]],
            model: [this.asset?.model || 'N/A', [Validators.required]],
            size: [this.asset?.size || 'N/A', [Validators.required]],
            color: [this.asset?.color || 'N/A', [Validators.required]],
            po: [this.asset?.po || 'N/A', [Validators.required]],
            warranty: [this.asset?.warranty || 'N/A', [Validators.required]],
            cost: [
                this.asset?.cost || 'N/A',
                [Validators.required, Validators.pattern('^[0-9]*$')],
            ],
        });

        this.serialSubscription = this.eventForm
            .get('serial_number')!
            .valueChanges.pipe(distinctUntilChanged())
            .subscribe((value) => {
                this.cdr.detectChanges();
            });
    }

    // Clean up subscription on component destroy
    ngOnDestroy(): void {
        if (this.serialSubscription) {
            this.serialSubscription.unsubscribe();
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

    updateAsset(): void {
        if (this.eventForm.invalid) {
            return; // Prevent submission if form is invalid
        }

        const id = this.asset?.id ? String(this.asset.id) : null; // Convert to string safely
        if (!id) {
            console.error('No asset ID found.');
            return;
        }

        const formData = this.eventForm.value; // Get form data

        // Ensure history is formatted correctly as an array of strings
        const historyArray = Array.isArray(formData.history)
            ? formData.history.map((entry) => String(entry)) // Convert each entry to a string
            : [];

        // Map the form data to the expected response structure
        const updatedAsset = {
            asset_id: id,
            updated_by: formData.updated_by || 'Unknown',
            department: formData.department || '',
            type: formData.type || '',
            date_updated: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD
            asset_barcode: formData.asset_barcode || '',
            brand: formData.brand || '',
            model: formData.model || '',
            ram: formData.ram || '',
            hdd: formData.hdd || '', // ✅ Move hdd to top level
            ssd: formData.ssd || '', // ✅ Move ssd to top level
            gpu: formData.gpu || '',
            motherboard: formData.board || '',
            size: formData.size || '',
            color: formData.color || '',
            serial_no: formData.serial_number || '',
            po: formData.po || '',
            warranty: formData.warranty || '',
            cost: formData.cost || 0,
            remarks: formData.remarks || '',
            history:
                historyArray.length > 0
                    ? historyArray
                    : [
                          'Asset details updated on ' +
                              new Date().toISOString().split('T')[0],
                      ],
            li_description: formData.li_description || '',
            company: formData.company || '', // Ensure company is sent
            user_name: formData.user_name || '', // Ensure user_name is sent
            date_acquired: formData.date_acquired || '', // Ensure date_acquired is sent
        };

        // Log the final updated asset before submitting
        console.log('Submitting updated asset:', updatedAsset);

        this.assetsService.putEvent(id, updatedAsset).subscribe({
            next: (response) => {
                console.log('API Response:', response);
              
                // Trigger success alert for asset added or updated
                this.alertService.triggerSuccess('Asset successfully added!');
              
                // If this is for an update (based on the previous example), change the message accordingly
                // Example: for asset update success:
                // alert('Asset updated successfully!'); // or use this line instead of alertService if needed
              
                // ✅ Reload without resetting fields manually
                setTimeout(() => {
                  window.location.reload();
                }, 1000); // Small delay for the alert to be visible
              },
              
              error: (error) => {
                console.error('API Error:', error);
              
                // Trigger error alert for both add and update failures
                this.alertService.triggerError('Failed to add asset. Please try again.');
              
                // For validation errors, handle them dynamically as in the update example
                if (error.status === 400 && error.error?.errors) {
                  let errorMessages = [];
              
                  // Iterate over all error fields and collect messages
                  Object.keys(error.error.errors).forEach((key) => {
                    errorMessages.push(
                      `${key}: ${error.error.errors[key].join(', ')}`
                    );
                  });
              
                  // Display error messages in an alert or console
                  alert('Validation Errors:\n' + errorMessages.join('\n'));
                } else {
                  alert('Failed to add asset.'); // Or 'Failed to update asset.' depending on context
                }
              },
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
