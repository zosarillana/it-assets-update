import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ModalUniversalComponent } from '../../components/modal/modal-universal/modal-universal.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Assets } from 'app/models/Inventory/Asset';
import { AlertService } from 'app/services/alert.service';
import { ComponentsService } from 'app/services/components/components.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { MatTabGroup } from '@angular/material/tabs';
import { Location } from '@angular/common';

@Component({
    selector: 'app-components-edit',
    templateUrl: './components-edit.component.html',
    styleUrls: ['./components-edit.component.scss'],
})
export class ComponentsEditComponent implements OnInit {
    // asset!: Assets;
    asset: Assets | null = null;
    eventForm!: FormGroup;
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef,

        private route: ActivatedRoute,
        private assetsService: ComponentsService,
        private dialog: MatDialog,
        private alertService: AlertService,
        private router: Router,
        private _formBuilder: FormBuilder,
        private location: Location
    ) {}
    private initializeForm(): void {
        this.eventForm = this._formBuilder.group({
            image: [null],
            serial_number: [
                this.asset?.serial_no || 'N/A',
                Validators.required,
            ],

            uid: [this.asset?.uid || '', [Validators.required]],
            cost: [
                this.asset?.cost,
                [Validators.required, Validators.pattern('^[0-9]*$')],
            ], // ✅ Ensure cost is a number
            description: [
                this.asset?.description || 'N/A',
                [Validators.required],
            ],
            color: [this.asset?.color || 'N/A', [Validators.required]],
        });
    }

    goBack(): void {
        this.location.back();
      }

    ngOnInit(): void {
        const uid = this.route.snapshot.paramMap.get('uid');

        if (uid) {
            this.assetsService.getComponentsById(uid).subscribe({
                next: (data) => {
                    this.asset = data;
                    this.initializeForm(); // Initialize form only after asset is available
                },
                error: (err) => console.error('Error fetching asset', err),
            });
        } else {
            this.initializeForm(); // Initialize with default values if no asset is found
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

    openDeleteDialog(id: string): void {
        const dialogRef = this.dialog.open(ModalUniversalComponent, {
            width: '400px',
            data: { name: 'Are you sure you want to delete this item?' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.deleteItem(id);
            }
        });
    }

    private deleteItem(id: string): void {
        this.assetsService.deleteEvent(id).subscribe({
            next: () => {
                this.alertService.triggerSuccess('Item deleted successfully!');
                // Redirect to '/assets/components' on success
                this.router.navigate(['/assets/components']);
            },
            error: (err) => {
                console.error('Error deleting item:', err);
                this.alertService.triggerError('Failed to delete item.');
            },
        });
    }

    updateComponent(): void {
        if (this.eventForm.invalid) {
            this.alertService.triggerError('Please fill in all required fields.');
            return;
        }
    
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.alertService.triggerError('No valid component ID found.');
            return;
        }
    
        this.assetsService.putEvent(id, this.eventForm.value).subscribe({
            next: () => {
                this.alertService.triggerSuccess("Component updated successfully!");
    
                // Delay reload by 5 seconds (5000ms)
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            },
            error: (err) => {
                console.error('Error updating component:', err);
                this.alertService.triggerError('Failed to update component.');
            },
        });
    }
    

    //ts

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
