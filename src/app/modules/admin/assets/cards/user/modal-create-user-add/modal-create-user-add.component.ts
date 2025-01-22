import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ITOTService } from 'app/services/itot.service';
import { ItotPc } from 'app/models/ItotPc';
import { ItotPeripheral } from 'app/models/ItotPeripheral';
import { CardService } from 'app/services/card.service';
import { MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { trigger, transition, style, animate } from '@angular/animations';
import { AlertService } from 'app/services/alert.service';

@Component({
    selector: 'app-modal-create-user-add',
    templateUrl: './modal-create-user-add.component.html',
    styleUrls: ['./modal-create-user-add.component.scss'],
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
export class ModalCreateUserAddComponent implements OnInit {
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
        private dialogRef: MatDialogRef<ModalCreateUserAddComponent>,
        private _fuseConfirmationService: FuseConfirmationService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.horizontalStepperForm = this._formBuilder.group({
            step1: this._formBuilder.group({
                firstname: ['', [Validators.required]],
                lastname: ['', Validators.required],
                position: ['', Validators.required],
                employee_id: ['', Validators.required],
                contact_no: ['', Validators.required],                
            }),
            step2: this._formBuilder.group({
                department: ['', Validators.required],
                company: ['', Validators.required],
                location: ['', Validators.required],
                date_assigned: ['', Validators.required],
            }),
            step3: this._formBuilder.group({
                assign_pc: ['', Validators.required],
                assign_peripherals: ['', Validators.required],
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
        // Retrieve values from the form controls
        const step1 = this.horizontalStepperForm.get('step1')?.value;
        const step2 = this.horizontalStepperForm.get('step2')?.value;
    
        // Convert arrays to comma-separated strings
        const selectedPcIds = this.selectedPcs.map((pc) => pc.id).join(',');
        const selectedPeripheralIds = this.selectedPeris
            .map((peripheral) => peripheral.id)
            .join(',');
    
        const dateAssigned = step2.date_assigned || null;
    
        const cardData = {
            firstName: step1.firstname,
            lastName: step1.lastname,
            emp_id: step1.employee_id,
            contact_no: step1.contact_no,
            position: step1.position,
            dept_name: step2.department,
            company_name: step2.company,
            location: step2.location,
            date_assigned: dateAssigned,
            pc_id: selectedPcIds,
            peripheral_id: selectedPeripheralIds,
        };
    
        // Log the cardData before sending it
        console.log('Submitted Card Data:', cardData);
    
        // Submit the data via cardService
        this.cardService.CreateCardData(cardData).subscribe(
            (response) => {
                console.log('Card created successfully:', response);
                this.successMessage = 'Card created successfully!'; // Set success message
                this.successVisible = true; // Show success alert
    
                // Close the modal after a 5-second delay
                setTimeout(() => {
                    this.successVisible = false; // Fade out the success alert
                    setTimeout(() => {
                        this.successMessage = null; // Clear success message
                        this.dialogRef.close(); // Close the modal
                    }, 500); // Additional delay for fade-out effect
                }, 5000); // 5-second delay to show success message
            },
            (error) => {
                console.error('Error creating card:', error);
                this.errorMessage = error.error || 'An error occurred';
                this.errorVisible = true; // Show error alert
    
                // Clear error message after 5 seconds
                setTimeout(() => {
                    this.errorVisible = false; // This will trigger fade-out animation
                    setTimeout(() => {
                        this.errorMessage = null; // Clear error message
                    }, 500); // Additional delay for fade-out effect
                }, 5000);
            }
        );
    }
}    