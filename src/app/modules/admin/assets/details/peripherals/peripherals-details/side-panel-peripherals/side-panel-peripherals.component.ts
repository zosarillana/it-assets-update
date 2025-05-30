import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'app/services/alert.service';
import { ITOTService } from 'app/services/itot.service';

@Component({
    selector: 'app-side-panel-peripherals',
    templateUrl: './side-panel-peripherals.component.html',
    styleUrls: ['./side-panel-peripherals.component.scss'],
})
export class SidePanelPeripheralsComponent implements OnInit {
    isSidenavOpen = false; // State for the main sidenav
    isEditSidenavOpen = false; // State for the edit sidenav
    @Input() elementId: string | null = null;
    @Input() cardData: any;
    @Output() updateSuccess: EventEmitter<void> = new EventEmitter<void>(); // Create an emitter for successful update

    // ... other properties and methods
    editData: any; // Data for the item being edited
    myForm: FormGroup;

    constructor(
        private service: ITOTService,
        private router: Router,
        private _formBuilder: FormBuilder,
        private itotService: ITOTService,
        private alertService: AlertService
    ) {}

    ngOnInit(): void {
        this.myForm = this._formBuilder.group({
            date_acquired: ['', [Validators.required]],
            asset_barcode: ['', Validators.required],
            serial_no: ['', Validators.required],
            peripheral_type: ['', Validators.required],
            li_description: ['', Validators.required],
            size: ['', Validators.required],
            brand: ['', Validators.required],
            model: ['', Validators.required],
            color: ['', Validators.required],
        });
    }

    openSidenav() {
        this.isSidenavOpen = true;
        // console.log('Opening side panel with ID:', this.elementId);

        if (this.elementId) {
            // console.log(
            //     'Attempting to fetch card data for ID:',
            //     this.elementId
            // );
            this.service.getItotPeripheralsId(this.elementId).subscribe(
                (data) => {
                    this.cardData = data;
                    // console.log('Fetched card data:', data);
                },
                (error) => {
                    // console.error('Error fetching card data:', error);
                }
            );
        }
    }

    openEditSidePanel(element: any) {
        this.editData = { ...element }; // Create a copy of the element to edit
        this.isEditSidenavOpen = true; // Open the edit sidenav

        this.myForm.patchValue({
            date_acquired: this.editData.date_acquired
                ? new Date(this.editData.date_acquired)
                : '',
            asset_barcode: this.editData.asset_barcode,
            serial_no: this.editData.serial_no,
            peripheral_type: this.editData.peripheral_type,
            li_description: this.editData.li_description,
            size: this.editData.size,
            brand: this.editData.brand,
            model: this.editData.model,
            color: this.editData.color,
        });
    }

    closeEditSidenav() {
        this.isEditSidenavOpen = false; // Close the edit sidenav
    }

    //for view
    closeSidenav() {
        this.isSidenavOpen = false; // Close the edit sidenav
    }

    onUpdate(): void {
        if (this.myForm.valid) {
            const formData = this.myForm.value;
            this.itotService
                .UpdatePeripheral(this.editData.id, formData)
                .subscribe({
                    next: (response) => {
                        // console.log(
                        //     'Peripheral updated successfully',
                        //     response
                        // );
                        this.alertService.triggerSuccess(
                            'Peripheral updated successfully'
                        );
                        this.updateSuccess.emit(); // Emit event on successful update
                        this.closeEditSidenav(); // Optionally close the side panel after the update
                    },
                    error: (error) => {
                        // console.error('Error updating peripheral', error);
                        this.alertService.triggerError(
                            'Error updating peripheral'
                        );
                    },
                });
        } else {
            // console.log('Form is invalid');
            this.alertService.triggerError(
                'Please complete the form correctly.'
            );
        }
    }
}
