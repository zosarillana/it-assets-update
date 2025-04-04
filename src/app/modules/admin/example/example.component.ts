import { Component, OnInit } from '@angular/core';
import { ComputerService } from 'app/services/computer/computer.service';


@Component({
    selector: 'example',
    templateUrl: './example.component.html',
})
export class ExampleComponent implements OnInit {
    laptopCount: number = 0;
    cpuCount: number = 0;
    totalCount: number = 0;
    selectedType: string = 'ALL'; // Default selection
    displayedCount: number = 0;

    constructor(private computerService: ComputerService) {}

    ngOnInit(): void {
        this.getComputerCounts();
    }

    getComputerCounts(): void {
        this.computerService.getCount().subscribe(
            (data) => {
                const laptopData = data.find((item: any) => item.type === 'LAPTOP');
                const cpuData = data.find((item: any) => item.type === 'CPU');

                this.laptopCount = laptopData ? laptopData.count : 0;
                this.cpuCount = cpuData ? cpuData.count : 0;
                this.totalCount = this.laptopCount + this.cpuCount;

                this.updateDisplayedCount();
            },
            (error) => {
                console.error('Error fetching counts', error);
            }
        );
    }

    selectType(type: string): void {
        this.selectedType = type;
        this.updateDisplayedCount();
    }

    updateDisplayedCount(): void {
        if (this.selectedType === 'LAPTOP') {
            this.displayedCount = this.laptopCount;
        } else if (this.selectedType === 'CPU') {
            this.displayedCount = this.cpuCount;
        } else {
            this.displayedCount = this.totalCount;
        }
    }
}
