import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-side-panel-computer',
    templateUrl: './side-panel-computer.component.html',
    styleUrls: ['./side-panel-computer.component.scss'],
})
export class SidePanelComputerComponent implements OnInit {
    isPanelOpen = false;

    @Input() allTypes: string[] = [];
    @Input() selectedTypeToggle: string[] = [];
    @Input() departments: any[] = [];
    @Input() selectedDepartments: any[] = [];
    @Input() businessUnits: any[] = [];
    @Input() selectedBusinessUnits: any[] = [];

    @Output() filtersChanged = new EventEmitter<{
        types: string[];
        departments: any[];
        businessUnits: any[];
    }>();

    ngOnInit(): void {}

    closeSidenav() {
        this.isPanelOpen = false;
    }

    openPanel() {
        this.isPanelOpen = true;
    }

    emitFilterChange() {
        this.filtersChanged.emit({
            types: this.selectedTypeToggle,
            departments: this.selectedDepartments,
            businessUnits: this.selectedBusinessUnits,
        });
    }

    toggleType(type: string): void {
        const index = this.selectedTypeToggle.indexOf(type);
        if (index === -1) {
            this.selectedTypeToggle.push(type);
        } else {
            this.selectedTypeToggle.splice(index, 1);
        }
        this.emitFilterChange();
    }

    toggleDepartment(dept: any): void {
        const index = this.selectedDepartments.indexOf(dept);
        if (index === -1) {
            this.selectedDepartments.push(dept);
        } else {
            this.selectedDepartments.splice(index, 1);
        }
        this.emitFilterChange();
    }

    toggleBusinessUnit(bu: any): void {
        const index = this.selectedBusinessUnits.indexOf(bu);
        if (index === -1) {
            this.selectedBusinessUnits.push(bu);
        } else {
            this.selectedBusinessUnits.splice(index, 1);
        }
        this.emitFilterChange();
    }
}