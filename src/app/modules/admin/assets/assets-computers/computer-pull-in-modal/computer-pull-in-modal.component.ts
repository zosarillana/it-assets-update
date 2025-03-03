import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComponentsService } from '../../../../../services/components/components.service';

@Component({
  selector: 'app-computer-pull-in-modal',
  templateUrl: './computer-pull-in-modal.component.html',
  styleUrls: ['./computer-pull-in-modal.component.scss']
})
export class ComputerPullInModalComponent implements OnInit {
  inactiveComponents: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ComputerPullInModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private componentsService: ComponentsService
  ) { }

  ngOnInit(): void {
    console.log('Received computer ID:', this.data.computerId);
    this.fetchInactiveComponents();
  }

  fetchInactiveComponents(): void {
    this.componentsService.getComponents(1, 100, 'asc', 'INACTIVE').subscribe({
      next: (response) => {
        console.log('API Response:', response);
  
        // ✅ Extract the $values array from items
        if (response?.items?.$values && Array.isArray(response.items.$values)) {
          this.inactiveComponents = response.items.$values.filter(component => component.status === 'INACTIVE');
        } else {
          console.error('Unexpected API response format:', response);
          this.inactiveComponents = []; // Ensure it's an empty array to prevent errors
        }
  
        console.log('Inactive Components:', this.inactiveComponents);
      },
      error: (error) => {
        console.error('Error fetching inactive components:', error);
        this.inactiveComponents = [];
      }
    });
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }

  selectComponents(selectedComponents: any[]): void {
    const selectedComponentUids = selectedComponents.map(option => option.value.uid);
    console.log('Selected Components:', selectedComponentUids);
    
    selectedComponentUids.forEach(uid => {
      const request = { computer_id: this.data.computerId, component_uid: uid };
      this.componentsService.pullInComponent(request).subscribe({
        next: response => {
          console.log(`Component ${uid} response:`, response);
        },
        error: error => {
          console.error(`Error pulling in component ${uid}:`, error);
        }
      });
    });
    
    this.dialogRef.close(selectedComponentUids);
  }
}
