import { trigger, transition, style, animate } from '@angular/animations';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ItotPc } from 'app/models/ItotPc';
import { ItotPeripheral } from 'app/models/ItotPeripheral';
import { AlertService } from 'app/services/alert.service';
import { CardService } from 'app/services/card.service';
import { ITOTService } from 'app/services/itot.service';

@Component({
    selector: 'app-peripheral-modal-create',
    templateUrl: './peripheral-modal-create.component.html',
    styleUrls: ['./peripheral-modal-create.component.scss'],
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
export class PeripheralModalCreateComponent implements OnInit {
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
        private dialogRef: MatDialogRef<PeripheralModalCreateComponent>,
        private _fuseConfirmationService: FuseConfirmationService,
        private alertService: AlertService,
    ) {}

    ngOnInit() {
        this.horizontalStepperForm = this._formBuilder.group({
            step1: this._formBuilder.group({
                date_acquired: ['', [Validators.required]],
                asset_barcode: ['', Validators.required],
                serial_no: ['', Validators.required],
                peripheral_type: ['', Validators.required],
                // li_description: ['', Validators.required],
            }),
            step2: this._formBuilder.group({
                size: ['', Validators.required],
                brand: ['', Validators.required],
                model: ['', Validators.required],
                color: ['', Validators.required],
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
                this.pcs = barcodes.filter((pc) => pc.asset_barcode != null);
                this.filteredPcs = [...this.pcs];
            },
            (error) => {
                console.error('Error fetching ITOT barcodes:', error);
            }
        );

        this.itotService.getItotPeripherals().subscribe(
            (barcodes: ItotPeripheral[]) => {
                this.fruits = barcodes.filter(
                    (peripherals) => peripherals.asset_barcode != null
                );
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
        // Check if the form is valid
        if (this.horizontalStepperForm.valid) {
            const step1 = this.horizontalStepperForm.get('step1')?.value;
            const step2 = this.horizontalStepperForm.get('step2')?.value;
    
            const selectedPcIds = this.selectedPcs.map((pc) => pc.id).join(',');
            const selectedPeripheralIds = this.selectedPeris
                .map((peripheral) => peripheral.id)
                .join(',');
    
            const dateAssigned = step1.date_acquired || null;
    
            const Data = {
                date_acquired: dateAssigned,
                asset_barcode: step1.asset_barcode,
                serial_no: step1.serial_no,
                peripheral_type: step1.peripheral_type,
                li_description: " ",
                size: step2.size,
                brand: step2.brand,
                model: step2.model,
                color: step2.color,
            };
    
            console.log('Submitted Data:', Data);
    
            // Always create a new peripheral
            this.itotService.CreatePeripheral(Data).subscribe(
                (response) => {
                    console.log('Peripheral created successfully', response);
                    this.alertService.triggerSuccess('Peripheral created successfully');
                    this.dialogRef.close({ success: true }); // Close with success result
                },
                (error) => {
                    console.error('Error creating peripheral', error);
                    this.alertService.triggerError('Error creating peripheral');
                    this.dialogRef.close({ success: false }); // Close with failure result
                }
            );
        } else {
            console.log('Form is invalid');
            this.alertService.triggerError('Please complete the form correctly.');
        }
    }    
}    