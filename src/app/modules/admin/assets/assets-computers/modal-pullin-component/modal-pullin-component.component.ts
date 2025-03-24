import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComponentsService } from 'app/services/components/components.service';
import { MatSelectionList } from '@angular/material/list';

@Component({
    selector: 'app-modal-pullin-component',
    templateUrl: './modal-pullin-component.component.html',
    styleUrls: ['./modal-pullin-component.component.scss'],
})
export class ModalPullinComponentComponent implements OnInit {
    @ViewChild('componentsList') componentsList!: MatSelectionList; // ✅ Get reference to mat-selection-list

    inactiveComponents: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<ModalPullinComponentComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private componentsService: ComponentsService
    ) {}

    ngOnInit(): void {
        // console.log('Received computer ID:', this.data.computerId);
        this.fetchInactiveComponents();
    }

    fetchInactiveComponents(): void {
        this.componentsService
            .getComponents(1, 100, 'asc', 'AVAILABLE')
            .subscribe({
                next: (response) => {
                    // console.log('API Response:', response);

                    if (
                        response?.items?.$values &&
                        Array.isArray(response.items.$values)
                    ) {
                        this.inactiveComponents = response.items.$values.filter(
                            (component) => component.status === 'AVAILABLE'
                        );
                    } else {
                        // console.error('Unexpected API response format:', response);
                        this.inactiveComponents = [];
                    }

                    // console.log('Inactive Components:', this.inactiveComponents);
                },
                error: (error) => {
                    // console.error('Error fetching available components:', error);
                    this.inactiveComponents = [];
                },
            });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    selectComponents(): void {
        if (!this.componentsList) {
            // console.error('componentsList is not defined');
            return;
        }

        const selectedComponents = this.componentsList.selectedOptions.selected.map(option => option.value);
        const selectedComponentUids = selectedComponents.map(component => component.uid);

        // console.log('Selected Components:', selectedComponentUids);

        if (selectedComponentUids.length === 0) {
            this.dialogRef.close();
            return; // No components selected, just close the dialog
        }

        this.dialogRef.close(selectedComponentUids);
    }
}
