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
import { ActivatedRoute } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AlertService } from 'app/services/alert.service';
import { AssetsService } from 'app/services/assets/assets.service';
import { ComputerService } from 'app/services/computer/computer.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Location } from '@angular/common';

@Component({
    selector: 'app-computers-edit',
    templateUrl: './computers-edit.component.html',
    styleUrls: ['./computers-edit.component.scss'],
})
export class ComputersEditComponent implements OnInit {
    asset!: Assets;
    loading: boolean = false; // Add this line
    eventForm!: FormGroup;
    private serialSubscription: Subscription;
    constructor(
        private route: ActivatedRoute,
        private assetsService: ComputerService,
        private _formBuilder: FormBuilder,
        private cdr: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef,
        private alertService: AlertService,
        private location: Location
    ) {}
    typeOptions: string[] = ['CPU', 'LAPTOP'];
    warrantyOptions: { label: string; value: string }[] = [];

    // Initialize form with comprehensive validation
    private initializeForm(): void {
        this.eventForm = this._formBuilder.group({
            image: [null],
            serial_number: [
                this.asset?.serial_no || 'N/A',
                Validators.required,
            ],
            type: [this.asset?.type || ''],
            asset_barcode: [this.asset?.asset_barcode || ''],
            // fa_code: [this.asset?.fa_code || ''],
            date_acquired: [this.asset?.date_acquired],
            brand: [this.asset?.brand],
            model: [this.asset?.model],
            size: [this.asset?.size],
            color: [this.asset?.color],
            po: [this.asset?.po],
            warranty: [this.asset?.warranty],
            cost: [this.asset?.cost, [Validators.pattern('^[0-9]*$')]],
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

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.loading = true; // Start loading

            this.assetsService.getComputersById(id).subscribe({
                next: (data) => {
                    this.asset = data;
                    this.loading = false; // Stop loading
                    this.initializeForm(); // Initialize form AFTER you have the data
                    this.cdr.detectChanges(); // Trigger change detection
                },
                error: (err) => {
                    console.error('Error fetching asset', err);
                    this.loading = false; // Stop loading even on error
                    this.initializeForm(); // Ensure form initializes even if data fetch fails
                },
            });
        } else {
            this.initializeForm(); // Initialize with default values if no ID is provided
        }

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

    getWarrantyLabel(value: string): string | null {
        const option = this.warrantyOptions.find((opt) => opt.value === value);
        return option ? option.label : null;
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
            asset_barcode: formData.serial_number || '',
            fa_code: formData.fa_code || '',
            brand: formData.brand || '',
            model: formData.model || '',
            ram: formData.ram || '',
            hdd: formData.hdd || '', // ✅ Move hdd to top level
            ssd: formData.ssd || '', // ✅ Move ssd to top level
            gpu: formData.gpu || '',
            board: formData.gpu || '',
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
        // console.log('Submitting updated asset:', updatedAsset);

        this.assetsService.putEvent(id, updatedAsset).subscribe({
            next: (response) => {
                // console.log('Asset updated successfully', response);
                this.alertService.triggerSuccess('Asset updated successfully!');
                setTimeout(() => {
                    window.location.reload();
                }, 1000); // S
            },
            error: (err) => {
                // console.error('Error updating asset', err);

                if (err.status === 400 && err.error?.errors) {
                    let errorMessages = [];
                    Object.keys(err.error.errors).forEach((key) => {
                        errorMessages.push(
                            `${key}: ${err.error.errors[key].join(', ')}`
                        );
                    });

                    this.alertService.triggerError(
                        'Validation Errors:\n' + errorMessages.join('\n')
                    );
                } else {
                    this.alertService.triggerError('Failed to update asset.');
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
  * Go to next step

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

    goBack(): void {
        this.location.back();
    }
}
