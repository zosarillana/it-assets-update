import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComponentsService } from 'app/services/components/components.service';

@Component({
    selector: 'app-modal-pullin-component',
    templateUrl: './modal-pullin-component.component.html',
    styleUrls: ['./modal-pullin-component.component.scss'],
})
export class ModalPullinComponentComponent implements OnInit {
    inactiveComponents: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<ModalPullinComponentComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private componentsService: ComponentsService
    ) {}

    ngOnInit(): void {
        console.log('Received computer ID:', this.data.computerId);
        this.fetchInactiveComponents();
    }

    fetchInactiveComponents(): void {
        this.componentsService
            .getComponents(1, 100, 'asc', 'INACTIVE')
            .subscribe({
                next: (response) => {
                    console.log('API Response:', response);

                    // ✅ Extract the $values array from items
                    if (
                        response?.items?.$values &&
                        Array.isArray(response.items.$values)
                    ) {
                        this.inactiveComponents = response.items.$values.filter(
                            (component) => component.status === 'INACTIVE'
                        );
                    } else {
                        console.error(
                            'Unexpected API response format:',
                            response
                        );
                        this.inactiveComponents = []; // Ensure it's an empty array to prevent errors
                    }

                    console.log(
                        'Inactive Components:',
                        this.inactiveComponents
                    );
                },
                error: (error) => {
                    console.error('Error fetching inactive components:', error);
                    this.inactiveComponents = [];
                },
            });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
    selectComponents(selectedComponents: any[]): void {
      const selectedComponentUids = selectedComponents.map(option => option.value.uid);
      console.log('Selected Components:', selectedComponentUids);
  
        if (selectedComponentUids.length === 0) {
            this.dialogRef.close();
            return; // No components selected, just close the dialog
        }
      this.dialogRef.close(selectedComponentUids);
  }
  
}
