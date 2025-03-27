import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-side-panel-inventory',
  templateUrl: './side-panel-inventory.component.html',
  styleUrls: ['./side-panel-inventory.component.scss']
})
export class SidePanelInventoryComponent implements OnInit {
//Sidenav
    isPanelOpen = false; // State for the main sidenav
    
    @Input() allTypes: string[] = [];
    @Input() selectedTypeToggle: string[] = [];
    @Output() typeSelected = new EventEmitter<string[]>();
    constructor() {}

    ngOnInit(): void {}
    //for view
    closeSidenav() {
        this.isPanelOpen = false; // Close the edit sidenav
    }

    openPanel() {
        this.isPanelOpen = true;
        // console.log('Opening side panel with ID:', this.elementId);
        // if (this.elementId) {
        //     // console.log(
        //     //     'Attempting to fetch card data for ID:',
        //     //     this.elementId
        //     // );
        //     this.service.getItotPeripheralsId(this.elementId).subscribe(
        //         (data) => {
        //             this.cardData = data;
        //             // console.log('Fetched card data:', data);
        //         },
        //         (error) => {
        //             // console.error('Error fetching card data:', error);
        //         }
        //     );
        // }
    }

    onTypeSelected() {
        this.typeSelected.emit(this.selectedTypeToggle);
    }

    toggleType(type: string): void {
        const index = this.selectedTypeToggle.indexOf(type);
        if (index === -1) {
            this.selectedTypeToggle = [...this.selectedTypeToggle, type]; // Add type
        } else {
            this.selectedTypeToggle = this.selectedTypeToggle.filter(t => t !== type); // Remove type
        }
        this.onTypeSelected(); // Emit the change
    }
    
}
