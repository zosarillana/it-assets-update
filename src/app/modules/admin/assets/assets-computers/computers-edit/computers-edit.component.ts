import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AssetsService } from 'app/services/assets/assets.service';
import { ComputerService } from 'app/services/computer/computer.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-computers-edit',
    templateUrl: './computers-edit.component.html',
    styleUrls: ['./computers-edit.component.scss'],
})
export class ComputersEditComponent implements OnInit {
    asset!: Assets;
    eventForm!: FormGroup;
       private serialSubscription: Subscription;
    constructor(
        private route: ActivatedRoute,
        private assetsService: ComputerService,
        private _formBuilder: FormBuilder,
        private cdr: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef
     
    ) {}
    typeOptions: string[] = ['CPU', 'LAPTOP'];

    // Initialize form with comprehensive validation
    private initializeForm(): void {
        this.eventForm = this._formBuilder.group({
            image: [null],
            serial_number: [this.asset?.serial_no || 'N/A', Validators.required],
            type: [this.asset?.type || '', [Validators.required]],
            asset_barcode: [this.asset?.asset_barcode || '', [Validators.required]],
            date_acquired: [this.asset?.date_acquired, [Validators.required]],
            brand: [this.asset?.brand, [Validators.required]],
            model: [this.asset?.model, [Validators.required]],
            size: [this.asset?.size, [Validators.required]],
            color: [this.asset?.color, [Validators.required]],
            po: [this.asset?.po, [Validators.required]],
            warranty: [this.asset?.warranty, [Validators.required]],
            cost: [this.asset?.cost, [Validators.required, Validators.pattern("^[0-9]*$")]],           
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
            this.assetsService.getComputersById(id).subscribe({
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
            updated_by: formData.updated_by || "Unknown",
            department: formData.department || "",
            type: formData.type || "",
            date_updated: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD
            asset_barcode: formData.asset_barcode || "",
            brand: formData.brand || "",
            model: formData.model || "",
            ram: formData.ram || "",
            hdd: formData.hdd || "", // ✅ Move hdd to top level
            ssd: formData.ssd || "", // ✅ Move ssd to top level
            gpu: formData.gpu || "",
            motherboard: formData.board || "",
            size: formData.size || "",
            color: formData.color || "",
            serial_no: formData.serial_number || "",
            po: formData.po || "",
            warranty: formData.warranty || "",
            cost: formData.cost || 0,
            remarks: formData.remarks || "",
            history: historyArray.length > 0 ? historyArray : [ "Asset details updated on " + new Date().toISOString().split('T')[0] ],
            li_description: formData.li_description || "",
            company: formData.company || "", // Ensure company is sent
            user_name: formData.user_name || "", // Ensure user_name is sent
            date_acquired: formData.date_acquired || "" // Ensure date_acquired is sent
        };
        
        
    
        // Log the final updated asset before submitting
        console.log("Submitting updated asset:", updatedAsset);
    
        this.assetsService.putEvent(id, updatedAsset).subscribe({
            next: (response) => {
                console.log('Asset updated successfully', response);
                alert('Asset updated successfully!');
            },
            error: (err) => {
                console.error('Error updating asset', err);
    
                // Handle specific validation errors dynamically
                if (err.status === 400 && err.error?.errors) {
                    let errorMessages = [];
    
                    // Iterate over all error fields and collect messages
                    Object.keys(err.error.errors).forEach((key) => {
                        errorMessages.push(`${key}: ${err.error.errors[key].join(", ")}`);
                    });
    
                    // Display error messages in an alert or console
                    alert("Validation Errors:\n" + errorMessages.join("\n"));
                } else {
                    alert('Failed to update asset.');
                }
            },
        });
    }
    
 //drawer 
 drawerMode: 'over' | 'side' = 'side';
 drawerOpened: boolean = true;
 currentStep: number = 0
 @ViewChild('courseSteps', {static: true}) courseSteps: MatTabGroup;

 trackByFn(index: number, item: any): any
 {
     return item.id || index;
 }
 
 goToStep(step: number): void
 {
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
 goToPreviousStep(): void
 {
     // Return if we already on the first step
     if ( this.currentStep === 0 )
     {
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
private _scrollCurrentStepElementIntoView(): void
{
    // Wrap everything into setTimeout so we can make sure that the 'current-step' class points to correct element
    setTimeout(() => {

        // Get the current step element and scroll it into view
        const currentStepElement = this._document.getElementsByClassName('current-step')[0];
        if ( currentStepElement )
        {
            currentStepElement.scrollIntoView({
                behavior: 'smooth',
                block   : 'start'
            });
        }
    });
}
}
