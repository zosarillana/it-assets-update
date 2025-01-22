import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'app/services/alert.service';
import { ITOTService } from 'app/services/itot.service';

@Component({
    selector: 'app-side-panel-pcs',
    templateUrl: './side-panel-pcs.component.html',
    styleUrls: ['./side-panel-pcs.component.scss'],
})
export class SidePanelPcsComponent implements OnInit {
    isSidenavOpen = false; // State for the sidenav
    isEditSidenavOpen = false; // State for the edit sidenav
    @Input() elementId: string | null = null;
    @Input() cardData: any;
    @Output() updateSuccess: EventEmitter<void> = new EventEmitter<void>();
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
            brand: ['', Validators.required],
            model: ['', Validators.required],
            pc_type: ['', Validators.required],
            ram: ['', Validators.required],
            storage_capacity: ['', Validators.required],
            storage_type: ['', Validators.required],
            operating_system: ['', Validators.required],
            graphics: ['', [Validators.required]],
            size: ['', Validators.required],
            color: ['', Validators.required],
            serial_no: ['', Validators.required],
            status: ['', Validators.required],
            assigned: ['', Validators.required],
            history: ['', Validators.required],
            li_description: ['', Validators.required],
        });
    }

    openSidenav() {
        this.isSidenavOpen = true;
        console.log('Opening side panel with ID:', this.elementId);

        if (this.elementId) {
            console.log(
                'Attempting to fetch card data for ID:',
                this.elementId
            );
            this.service.getItotPcsId(this.elementId).subscribe(
                (data) => {
                    this.cardData = data;
                    console.log('Fetched card data:', data);
                },
                (error) => {
                    console.error('Error fetching card data:', error);
                }
            );
        }
    }

    viewDetails() {
        this.router.navigate(['assets/cards/pcs/details', this.cardData.id]);
    }

    // Method to close the sidenav
    closeSidenav() {
        this.isSidenavOpen = false;
    }

    openEditSidePanel(element: any) {
        this.editData = { ...element }; // Create a copy of the element to edit
        this.isEditSidenavOpen = true; // Open the edit sidenav

        this.myForm.patchValue({
            date_acquired: this.editData.date_acquired
                ? new Date(this.editData.date_acquired)
                : '',
            asset_barcode: this.editData.asset_barcode,
            brand: this.editData.brand,
            model: this.editData.model,
            pc_type: this.editData.pc_type,
            ram: this.editData.ram,
            storage_capacity: this.editData.storage_capacity,
            storage_type: this.editData.storage_type,
            operating_system: this.editData.operating_system,
            graphics: this.editData.graphics,
            size: this.editData.size,
            color: this.editData.color,
            serial_no: this.editData.serial_no,
            status: this.editData.status,
            assigned: this.editData.assigned,
            history: this.editData.history,
            li_description: this.editData.li_description,
        });
    }

    closeEditSidenav() {
        this.isEditSidenavOpen = false; // Close the edit sidenav
    }

    onUpdate(): void {
      if (this.myForm.valid) {
          const formData = this.myForm.value;
          this.itotService.UpdatePc(this.editData.id, formData).subscribe({
              next: (response) => {
                  console.log('Peripheral updated successfully', response);
                  this.alertService.triggerSuccess('Peripheral updated successfully');
                  this.updateSuccess.emit(); // Emit event on successful update
                  this.closeEditSidenav(); // Optionally close the side panel after the update
              },
              error: (error) => {
                  console.error('Error updating peripheral', error);
                  this.alertService.triggerError('Error updating peripheral');
              },
          });
      } else {
          console.log('Form is invalid');
          this.alertService.triggerError('Please complete the form correctly.');
      }
  }
}
