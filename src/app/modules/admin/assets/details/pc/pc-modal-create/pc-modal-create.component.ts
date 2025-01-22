import { trigger, transition, style, animate } from '@angular/animations';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ItotPc } from 'app/models/ItotPc';
import { ItotPeripheral } from 'app/models/ItotPeripheral';
import { CardService } from 'app/services/card.service';
import { ITOTService } from 'app/services/itot.service';
import { ModalCreatePcCardComponent } from '../../../cards/pc/modal-create-pc-card/modal-create-pc-card.component';
import { AlertService } from 'app/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-pc-modal-create',
    templateUrl: './pc-modal-create.component.html',
    styleUrls: ['./pc-modal-create.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('300ms ease-in', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                style({ opacity: 1 }),
                animate('300ms ease-out', style({ opacity: 0 })),
            ]),
        ]),
    ],
})
export class PcModalCreateComponent implements OnInit {
    configForm: FormGroup;
    isLinear = false;
    horizontalStepperForm: FormGroup;

    fruits: ItotPeripheral[] = [];
    filteredFruits: ItotPeripheral[] = [];
    selectedPeris: ItotPeripheral[] = [];
    currentFruit = '';

    pcs: ItotPc[] = [];
    filteredPcs: ItotPc[] = [];
    selectedPcs: ItotPc[] = [];
    currentPc = '';

    successMessage: string | null = null; // Success message variable
    successVisible: boolean = false; // Flag to control visibility
    errorVisible: boolean = false;
    errorMessage: string | null = null;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(
        private _formBuilder: FormBuilder,
        private itotService: ITOTService,
        private cardService: CardService,
        private dialogRef: MatDialogRef<ModalCreatePcCardComponent>,
        private _fuseConfirmationService: FuseConfirmationService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.horizontalStepperForm = this._formBuilder.group({
            step1: this._formBuilder.group({
                asset_barcode: ['', [Validators.required]],
                date_acquired: ['', Validators.required],
                pc_type: ['', Validators.required],
                brand: ['', Validators.required],
                model: ['', Validators.required],
            }),
            step2: this._formBuilder.group({
                processor: ['', Validators.required],
                ram: ['', Validators.required],
                storage_capacity: ['', Validators.required],
                storage_type: ['', Validators.required],
                operating_system: ['', Validators.required],
            }),
            step3: this._formBuilder.group({
                graphics: ['', Validators.required],
                size: ['', Validators.required],
                color: ['', Validators.required],
                serial_no: ['', Validators.required],
            }),
        });

        // Build the confirmation dialog config form
        this.configForm = this._formBuilder.group({
            title: 'Submit Confirmation',
            message:
                'Are you sure you want to submit this form? <span class="font-medium">This action cannot be undone!</span>',
            icon: this._formBuilder.group({
                show: true,
                name: 'feather:check',
                color: 'primary',
            }),
            actions: this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show: true,
                    label: 'Submit',
                    color: 'primary',
                }),
                cancel: this._formBuilder.group({
                    show: true,
                    label: 'Cancel',
                }),
            }),
            dismissible: true,
        });

        this.loadBarcodes();
    }

    loadBarcodes() {
        this.itotService.getItots().subscribe(
            (barcodes: ItotPc[]) => {
                this.pcs = barcodes
                    .filter((pc) => pc.asset_barcode != null)
                    .filter((pc) => pc.assigned === "Not Assigned"); // Add this filter
                this.filteredPcs = [...this.pcs];
            },
            (error) => {
                console.error('Error fetching ITOT barcodes:', error);
            }
        );
    
        this.itotService.getItotPeripherals().subscribe(
            (barcodes: ItotPeripheral[]) => {
                this.fruits = barcodes
                    .filter((peripherals) => peripherals.asset_barcode != null)
                    .filter((peripherals) => peripherals.assigned === "Not Assigned"); // Add this filter
                this.filteredFruits = [...this.fruits];
            },
            (error) => {
                console.error('Error fetching ITOT barcodes:', error);
            }
        );
    }

    add(event: any): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            const newPeripheral = this.fruits.find(
                (peripheral) => peripheral.asset_barcode === value.trim()
            );

            if (newPeripheral && !this.selectedPeris.includes(newPeripheral)) {
                this.selectedPeris.push(newPeripheral);
            }
        }

        if (input) {
            input.value = '';
        }

        this.currentFruit = '';
    }

    remove(peripherals: ItotPeripheral): void {
        const index = this.selectedPeris.indexOf(peripherals);
        if (index >= 0) {
            this.selectedPeris.splice(index, 1);
        }
    }

    selectedPeripherals(event: any): void {
        const selectedPeris = this.fruits.find(
            (peripheral) => peripheral.asset_barcode === event.option.value
        );

        if (selectedPeris && !this.selectedPeris.includes(selectedPeris)) {
            this.selectedPeris.push(selectedPeris);
        }

        this.currentFruit = '';
    }

    filterFruits(value: string): void {
        const filterValue = value.toLowerCase();
        this.filteredFruits = this.fruits.filter((pc) =>
            pc.asset_barcode.toLowerCase().includes(filterValue)
        );
    }

    addPc(event: any): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            const newPc = this.pcs.find(
                (pc) => pc.asset_barcode === value.trim()
            );
            if (newPc && !this.selectedPcs.includes(newPc)) {
                this.selectedPcs.push(newPc);
            }
        }

        if (input) {
            input.value = '';
        }

        this.currentPc = '';
    }

    selectedPc(event: any): void {
        const selectedPc = this.pcs.find(
            (pc) => pc.asset_barcode === event.option.value
        );

        if (selectedPc && !this.selectedPcs.includes(selectedPc)) {
            this.selectedPcs.push(selectedPc);
        }

        this.currentPc = '';
    }

    removePc(pc: ItotPc): void {
        const index = this.selectedPcs.indexOf(pc);
        if (index >= 0) {
            this.selectedPcs.splice(index, 1);
        }
    }

    filterPCs(value: string): void {
        const filterValue = value.toLowerCase();
        this.filteredPcs = this.pcs.filter((pc) =>
            pc.asset_barcode.toLowerCase().includes(filterValue)
        );
    }

    openConfirmationDialog(): void {
        // Open the confirmation dialog and save the reference of it
        const dialogRef = this._fuseConfirmationService.open(
            this.configForm.value
        );

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.submitForm(); // Call the submit form method if confirmed
            } else {
                console.log('Submission canceled');
            }
        });
    }

    submitForm() {
        // Retrieve values from the form controls
        const step1 = this.horizontalStepperForm.get('step1')?.value;
        const step2 = this.horizontalStepperForm.get('step2')?.value;
        const step3 = this.horizontalStepperForm.get('step3')?.value;

        // Convert arrays to comma-separated strings
        const selectedPcIds = this.selectedPcs.map((pc) => pc.id).join(',');
        const selectedPeripheralIds = this.selectedPeris
            .map((peripheral) => peripheral.id)
            .join(',');

        const dateAssigned = step1.date_acquired || null;

        const cardData = {
            asset_barcode: step1.asset_barcode,
            date_acquired: dateAssigned,
            pc_type: step1.pc_type,
            brand: step1.brand,
            model: step1.model,
            processor: step2.processor,
            ram: step2.ram,
            storage_capacity: step2.storage_capacity,
            storage_type: step2.storage_type,
            operating_system: step2.operating_system,
            graphics: step3.graphics,
            size: step3.size,
            color: step3.color,
            serial_no: step3.serial_no,
        };

        // Log the cardData before sending it
        console.log('Submitted Card Data:', cardData);

        // Submit the data via cardService
        if (this.horizontalStepperForm.valid) {
            // Submit the data via cardService
            this.itotService.CreatePc(cardData).subscribe({
                next: (response) => {
                    console.log('PC created successfully', response);
                    this.alertService.triggerSuccess('PC created successfully');
                    this.dialogRef.close({ success: true }); // Close with success result
                },
                error: (error: HttpErrorResponse) => {
                    console.error('Error creating PC', error.error);
        
                    // Check if error contains a specific message
                    let errorMessage = 'An unexpected error occurred.';
                    if (error.error) {
                        // If error.error is a string (as is common for API error messages)
                        errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
                    }
        
                    // Display the extracted or fallback error message to the user
                    this.alertService.triggerError(errorMessage);
        
                    // Keep the dialog open for the user to retry
                },
            });
        } else {
            console.log('Form is invalid');
            this.alertService.triggerError(
                'Please complete the form correctly.'
            );
        }        
    }
}
