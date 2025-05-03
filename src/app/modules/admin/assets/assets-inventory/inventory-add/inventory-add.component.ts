import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { AlertService } from 'app/services/alert.service';
import { AssetsService } from 'app/services/assets/assets.service';
import { ComponentsService } from 'app/services/components/components.service';
import { ComputerService } from 'app/services/computer/computer.service';
import { PeripheralService } from 'app/services/peripheral/peripheral.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-add-inventory',
    templateUrl: './inventory-add.component.html',
    styleUrls: ['./inventory-add.component.scss'],
})
export class InventoryAddComponent implements OnInit {
    eventForm!: FormGroup;
    peripherals = [];

    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _formBuilder: FormBuilder,
        private assetService: AssetsService,
        private alertService: AlertService,
        private _changeDetectorRef: ChangeDetectorRef,
        private peripheralService: PeripheralService

    
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
            remarks: ['', [Validators.required]],
            cost: ['', [Validators.required, Validators.pattern("^[0-9]*$")]]
        });
    }

    ngOnInit(): void {
        this.initializeForm();

         // Fetch peripherals data from the service
    this.peripheralService.getPeripherals().subscribe((data) => {
        this.peripherals = data;
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

    validateNumber(event: KeyboardEvent) {
        const inputChar = event.key;
        if (!/^\d$/.test(inputChar) && inputChar !== 'Backspace' && inputChar !== 'Tab') {
            event.preventDefault();
        }
    }

    
    submitForm(): void {
        // Validate the form before processing
        if (this.eventForm.invalid) {
          this.alertService.triggerError('Please fill in all required fields.');
          return;
        }
      
        // Get raw form data
        const rawData = this.eventForm.value;
      
        // Transform form data to API format
        const mappedData = this.mapResponseToForm(rawData);
      
        // Update form values to ensure correct structure
        this.eventForm.patchValue(mappedData);
      
        // Submit data to the API
        this.assetService.postEvent(mappedData).subscribe({
          next: (response) => {
            // console.log('API Response:', response);
            this.alertService.triggerSuccess('Asset successfully added!');
      
            // ✅ Reload without resetting fields manually
            setTimeout(() => {
              window.location.reload();
            }, 1000); // Small delay for the alert to be visible
          },
          error: (error) => {
            console.error('API Error:', error);
            this.alertService.triggerError('Failed to add asset. Please try again.');
          },
        });
      }
      
    
    

    // **Mapping Function: Converts API response to FormGroup structure**
    private mapResponseToForm(response: any): any {
        return {
            type: response.type || '',  // Keep the original type value
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
            cost: response.cost,
            remarks: response.remarks,
            asset_image: '',
            gpu: '',
            hdd: '',
            li_description: '',
            ram: '',
            size: '', 
            ssd: ''
        };
    }
    


    // **Helper function to format date to 'YYYY-MM-DD'**
    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    //drawer 
    //course dummy data 

    course = {
        title: 'Master Angular Development',
        description: 'Learn the ins and outs of Angular development, from beginner to advanced.',
        duration: 120,
        totalSteps: 5,
        category: {
          slug: 'web',
          title: 'Web Development',
        },
        steps: [
          {
            order: 0,
            title: 'Introduction to Angular',
            subtitle: 'Get familiar with Angular framework basics.',
            content: '<p>This is the content for step 1. It introduces Angular fundamentals.</p>',
          },
        
        ],
      };
     //drawer 
        drawerMode: 'over' | 'side' = 'side';
        drawerOpened: boolean = true;
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
