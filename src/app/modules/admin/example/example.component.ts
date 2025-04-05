import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ComponentsService } from 'app/services/components/components.service';
import { ComputerService } from 'app/services/computer/computer.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { AssetsService } from 'app/services/assets/assets.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'example',
    templateUrl: './example.component.html',
})
export class ExampleComponent implements OnInit {
    //COMPUTER
    laptopCount: number = 0;
    cpuCount: number = 0;
    totalCount: number = 0;
    displayedCount: number = 0;    
    selectedType: string = 'ALL'; // Default selection
    //COMPONENTS
    ramCount: number = 0;
    ssdCount: number = 0;
    hddCount: number = 0;
    gpuCount: number = 0;
    boardCount: number = 0;
    totalComponentCount: number = 0;
    displayedComponentCount: number = 0;
    selectedComponentType: string = 'ALL'; // Default selection
    // New variables for assets
    assetCounts: any[] = [];  // Stores the asset counts (e.g., AC Adapter, Monitor, etc.)
    selectedAssetType: string = 'ALL'; // Default selection for assets
    displayedAssetCount: number = 0; // The displayed count for assets
    totalAssetCount: number = 0;     // Total count of all assets

    constructor(private computerService: ComputerService, private componentService: ComponentsService, private assetService: AssetsService) {}

    ngOnInit(): void {
        // Using forkJoin to wait for all API calls to complete
        forkJoin({
            computers: this.computerService.getCount(),
            components: this.componentService.getCount(),
            assets: this.assetService.getCount()
        }).subscribe(
            (results) => {
                // Process computer data
                const laptopData = results.computers.find((item: any) => item.type === 'LAPTOP');
                const cpuData = results.computers.find((item: any) => item.type === 'CPU');
                this.laptopCount = laptopData ? laptopData.count : 0;
                this.cpuCount = cpuData ? cpuData.count : 0;
                this.totalCount = this.laptopCount + this.cpuCount;
                this.displayedCount = this.totalCount; // Set displayed count to total by default
                
                // Process component data
                const ramData = results.components.find((item: any) => item.type === 'RAM');
                const ssdData = results.components.find((item: any) => item.type === 'SSD');
                const hddData = results.components.find((item: any) => item.type === 'HDD');
                const gpuData = results.components.find((item: any) => item.type === 'GPU');
                const boardData = results.components.find((item: any) => item.type === 'BOARD');

                this.ramCount = ramData ? ramData.count : 0;
                this.ssdCount = ssdData ? ssdData.count : 0;
                this.hddCount = hddData ? hddData.count : 0;
                this.gpuCount = gpuData ? gpuData.count : 0;
                this.boardCount = boardData ? boardData.count : 0;
                this.totalComponentCount = this.ramCount + this.ssdCount + this.hddCount + this.gpuCount + this.boardCount;
                this.displayedComponentCount = this.totalComponentCount; // Set displayed count to total by default
                
                // Process asset data
                this.assetCounts = results.assets;
                this.totalAssetCount = this.assetCounts.reduce((total, item) => total + item.count, 0);
                this.displayedAssetCount = this.totalAssetCount; // Set displayed count to total by default
                
                // Now update the chart once all data is available
                this.updateChart();
            },
            (error) => {
                console.error('Error fetching data', error);
            }
        );
    }

    // Card flip logic    
    flipped = false;

    flipCard() {
        this.flipped = !this.flipped;
    }

    
    // Expand/collapse logic
    isExpanded = false;
    expanded: boolean = false; // Define the property and set default to false
    toggleExpansion() {
        this.isExpanded = !this.isExpanded;
    }    
    
    // Method for individual data loading, can be used for refreshing specific data
    getComputerCounts(): void {
        this.computerService.getCount().subscribe(
            (data) => {
                const laptopData = data.find((item: any) => item.type === 'LAPTOP');
                const cpuData = data.find((item: any) => item.type === 'CPU');

                this.laptopCount = laptopData ? laptopData.count : 0;
                this.cpuCount = cpuData ? cpuData.count : 0;
                this.totalCount = this.laptopCount + this.cpuCount;

                this.updateDisplayedCount();
                this.updateChart(); // Update chart after data changes
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
    
    getComponentCounts(): void {
        this.componentService.getCount().subscribe(
            (data) => {
                const ramData = data.find((item: any) => item.type === 'RAM');
                const ssdData = data.find((item: any) => item.type === 'SSD');
                const hddData = data.find((item: any) => item.type === 'HDD');
                const gpuData = data.find((item: any) => item.type === 'GPU');
                const boardData = data.find((item: any) => item.type === 'BOARD');

                this.ramCount = ramData ? ramData.count : 0;
                this.ssdCount = ssdData ? ssdData.count : 0;
                this.hddCount = hddData ? hddData.count : 0;
                this.gpuCount = gpuData ? gpuData.count : 0;
                this.boardCount = boardData ? boardData.count : 0;
                this.totalComponentCount = this.ramCount + this.ssdCount + this.hddCount + this.gpuCount + this.boardCount;

                this.updateDisplayedComponentCount();
                this.updateChart(); // Update chart after data changes
            },
            (error) => {
                console.error('Error fetching counts', error);
            }
        );
    }

    selectComponentType(type: string): void {
        this.selectedComponentType = type;
        this.updateDisplayedComponentCount();
    }

    updateDisplayedComponentCount(): void {
        if (this.selectedComponentType === 'RAM') {
            this.displayedComponentCount = this.ramCount;
        } else if (this.selectedComponentType === 'SSD') {
            this.displayedComponentCount = this.ssdCount;
        } else if (this.selectedComponentType === 'HDD') {
            this.displayedComponentCount = this.hddCount;
        } else if (this.selectedComponentType === 'GPU') {
            this.displayedComponentCount = this.gpuCount;
        } else if (this.selectedComponentType === 'BOARD') {
            this.displayedComponentCount = this.boardCount;
        } else {
            this.displayedComponentCount = this.totalComponentCount;
        }
    }

    // New method to fetch asset counts from the API
    getAssetCounts(): void {
        this.assetService.getCount().subscribe(
            (data) => {
                // Process the asset count data and update the asset count variables
                this.assetCounts = data;
                this.totalAssetCount = this.assetCounts.reduce((total, item) => total + item.count, 0);
                this.updateDisplayedAssetCount();
                this.updateChart(); // Update chart after data changes
            },
            (error) => {
                console.error('Error fetching asset counts', error);
            }
        );
    }

    selectAssetType(type: string): void {
        this.selectedAssetType = type;
        this.updateDisplayedAssetCount();
        this.updateChart(); // Update chart when selection changes
    }

    updateDisplayedAssetCount(): void {
        if (this.selectedAssetType === 'ALL') {
            // Sum all the asset counts
            this.displayedAssetCount = this.totalAssetCount;
        } else {
            // Find the count for the selected asset type
            const selectedAsset = this.assetCounts.find(item => item.type === this.selectedAssetType);
            this.displayedAssetCount = selectedAsset ? selectedAsset.count : 0;
        }
    }

    // Updating the chart data
    updateChart(): void {
        // Always use the totals for the chart, not the displayed counts
        this.chartData.series[0].data = [this.totalCount, this.totalComponentCount, this.totalAssetCount];
    }

    // Chart configuration for the counts of computers, components, and assets
    chartData = {
        chart: {
            type: 'line', // Changed from 'bar' to 'line' for a line chart
            height: '100%',
            width: '100%',
            toolbar: {
                show: false
            }
        },
        series: [{
            name: 'Count',
            data: [0, 0, 0] // Initially set the data to 0
        }],
        colors: ['#2E93fA'],
        dataLabels: {
            enabled: false
        },
        fill: {
            opacity: 1
        },
        grid: {
            show: true
        },
        stroke: {
            width: 2
        },
        tooltip: {
            enabled: true
        },
        xaxis: {
            categories: ['Computers', 'Components', 'Assets']
        },
        yaxis: {
            title: {
                text: 'Count'
            }
        }
    };
}