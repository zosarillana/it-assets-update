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
    assetCounts: any[] = []; // Stores the asset counts (e.g., AC Adapter, Monitor, etc.)
    selectedAssetType: string = 'ALL'; // Default selection for assets
    displayedAssetCount: number = 0; // The displayed count for assets
    totalAssetCount: number = 0; // Total count of all assets

    //dateUndefined
    dateUnidentified: number = 0;
    showChart: boolean = false; // Flag to control chart visibility

    availableYears: string[] = [];
    selectedYear: string = 'ALL'; // Default filter
    constructor(
        private computerService: ComputerService,
        private componentService: ComponentsService,
        private assetService: AssetsService
    ) {}

    ngOnInit(): void {
        // Using forkJoin to wait for all API calls to complete
        forkJoin({
            computers: this.computerService.getCount(),
            components: this.componentService.getCount(),
            assets: this.assetService.getCount(),
        }).subscribe(
            (results) => {
                // Process computer data
                const laptopData = results.computers.find(
                    (item: any) => item.type === 'LAPTOP'
                );
                const cpuData = results.computers.find(
                    (item: any) => item.type === 'CPU'
                );
                this.laptopCount = laptopData ? laptopData.count : 0;
                this.cpuCount = cpuData ? cpuData.count : 0;
                this.totalCount = this.laptopCount + this.cpuCount;
                this.displayedCount = this.totalCount; // Set displayed count to total by default

                // Process component data
                const ramData = results.components.find(
                    (item: any) => item.type === 'RAM'
                );
                const ssdData = results.components.find(
                    (item: any) => item.type === 'SSD'
                );
                const hddData = results.components.find(
                    (item: any) => item.type === 'HDD'
                );
                const gpuData = results.components.find(
                    (item: any) => item.type === 'GPU'
                );
                const boardData = results.components.find(
                    (item: any) => item.type === 'BOARD'
                );

                this.ramCount = ramData ? ramData.count : 0;
                this.ssdCount = ssdData ? ssdData.count : 0;
                this.hddCount = hddData ? hddData.count : 0;
                this.gpuCount = gpuData ? gpuData.count : 0;
                this.boardCount = boardData ? boardData.count : 0;
                this.totalComponentCount =
                    this.ramCount +
                    this.ssdCount +
                    this.hddCount +
                    this.gpuCount +
                    this.boardCount;
                this.displayedComponentCount = this.totalComponentCount; // Set displayed count to total by default

                // Process asset data
                this.assetCounts = results.assets;
                this.totalAssetCount = this.assetCounts.reduce(
                    (total, item) => total + item.count,
                    0
                );
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
                const laptopData = data.find(
                    (item: any) => item.type === 'LAPTOP'
                );
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
                const boardData = data.find(
                    (item: any) => item.type === 'BOARD'
                );

                this.ramCount = ramData ? ramData.count : 0;
                this.ssdCount = ssdData ? ssdData.count : 0;
                this.hddCount = hddData ? hddData.count : 0;
                this.gpuCount = gpuData ? gpuData.count : 0;
                this.boardCount = boardData ? boardData.count : 0;
                this.totalComponentCount =
                    this.ramCount +
                    this.ssdCount +
                    this.hddCount +
                    this.gpuCount +
                    this.boardCount;

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
                this.totalAssetCount = this.assetCounts.reduce(
                    (total, item) => total + item.count,
                    0
                );
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
            const selectedAsset = this.assetCounts.find(
                (item) => item.type === this.selectedAssetType
            );
            this.displayedAssetCount = selectedAsset ? selectedAsset.count : 0;
        }
    }

    private hasSelectedDefaultYear = false;
    // Updating the chart data
    updateChart(): void {
        forkJoin({
            computerDateCounts: this.computerService.getCountDate(),
            componentDateCounts: this.componentService.getCountDate(),
            assetDateCounts: this.assetService.getCountDate(),
        }).subscribe(
            (results) => {
                // Filter and count undefined dates across all data sets
                const undefinedDates = [
                    ...results.computerDateCounts,
                    ...results.componentDateCounts,
                    ...results.assetDateCounts,
                ].filter((item) => !this.isValidDate(item.date));

                this.dateUnidentified = undefinedDates.length;

                // Extract available years after loading data
                // Extract available years after loading data
                const dataYears = this.extractYearsFromData([
                    results.computerDateCounts,
                    results.componentDateCounts,
                    results.assetDateCounts,
                ]);
                this.availableYears = ['ALL', ...dataYears];

                // --- Default-select year logic, but only once ---
                if (!this.hasSelectedDefaultYear) {
                    const currentYear = new Date().getFullYear().toString();
                    if (dataYears.includes(currentYear)) {
                        this.selectedYear = currentYear;
                    } else if (dataYears.length > 0) {
                        // dataYears is sorted so pick last (latest) year
                        this.selectedYear = dataYears[dataYears.length - 1];
                    } else {
                        this.selectedYear = 'ALL';
                    }
                    this.hasSelectedDefaultYear = true;
                }    

                // Process valid dates and filter by year
                let allDates = [
                    ...results.computerDateCounts,
                    ...results.componentDateCounts,
                    ...results.assetDateCounts,
                ].filter((item) => this.isValidDate(item.date));

                // Filter by selected year
                if (this.selectedYear !== 'ALL') {
                    allDates = allDates.filter((item) => {
                        const date = new Date(item.date);
                        return (
                            date.getFullYear().toString() === this.selectedYear
                        );
                    });
                }

                // Extract unique dates and sort them
                const uniqueDates = [
                    ...new Set(allDates.map((item) => item.date)),
                ].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

                this.showChart = uniqueDates.length > 0;

                if (this.showChart) {
                    // Create maps for each category, filtered by year too!
                    const filterByYear = (arr: any[]) =>
                        this.selectedYear === 'ALL'
                            ? arr
                            : arr.filter((item) => {
                                  const date = new Date(item.date);
                                  return (
                                      date.getFullYear().toString() ===
                                      this.selectedYear
                                  );
                              });

                    const computerMap = this.createDateMap(
                        filterByYear(results.computerDateCounts)
                    );
                    const componentMap = this.createDateMap(
                        filterByYear(results.componentDateCounts)
                    );
                    const assetMap = this.createDateMap(
                        filterByYear(results.assetDateCounts)
                    );

                    // Format dates for display (Taipei timezone)
                    const formattedDates = uniqueDates.map((date) => {
                        const taipeiDate = new Date(date);
                        return taipeiDate.toLocaleDateString('en-US', {
                            timeZone: 'Asia/Taipei',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        });
                    });

                    // Prepare series data
                    const computerData = uniqueDates.map(
                        (date) => computerMap.get(date) || 0
                    );
                    const componentData = uniqueDates.map(
                        (date) => componentMap.get(date) || 0
                    );
                    const assetData = uniqueDates.map(
                        (date) => assetMap.get(date) || 0
                    );

                    // Update the chart data
                    this.chartData = {
                        ...this.chartData,
                        series: [
                            { name: 'Computers', data: computerData },
                            { name: 'Components', data: componentData },
                            { name: 'Assets', data: assetData },
                        ],
                        xaxis: {
                            ...this.chartData.xaxis,
                            categories: formattedDates,
                        },
                    };
                }
            },
            (error) => {
                console.error('Error fetching date-based data', error);
                this.showChart = false;
                this.dateUnidentified = 1;
            }
        );
    }

    // Helper method to create a date-to-count map
    private createDateMap(items: any[]): Map<string, number> {
        const map = new Map<string, number>();
        items
            .filter((item) => this.isValidDate(item.date))
            .forEach((item) => map.set(item.date, item.count));
        return map;
    }

    // Chart configuration for the counts of computers, components, and assets
    chartData = {
        chart: {
            type: 'line',
            height: '100%',
            width: '100%',
            toolbar: {
                show: false,
            },
        },
        series: [
            {
                name: 'Computers',
                data: [],
            },
            {
                name: 'Components',
                data: [],
            },
            {
                name: 'Assets',
                data: [],
            },
        ],
        colors: ['#2E93fA', '#FF9800', '#8BC34A'],
        dataLabels: {
            enabled: false,
        },
        fill: {
            opacity: 1,
        },
        grid: {
            show: true,
        },
        stroke: {
            width: 2,
            curve: 'smooth',
        },
        tooltip: {
            enabled: true,
            x: {
                show: true,
                formatter: (value) => {
                    // The value comes from the xaxis categories which we've already formatted
                    // in Taipei timezone, so we can just return it
                    return value + ' (Taipei Time)';
                },
            },
        },
        xaxis: {
            type: 'category',
            categories: [],
            labels: {
                rotate: -45,
                rotateAlways: false,
                style: {
                    fontSize: '12px',
                },
                formatter: (value) => {
                    // This formatter is for the x-axis labels
                    return value; // We've already formatted these in updateChart()
                },
            },
            tickPlacement: 'on',
        },
        yaxis: {
            title: {
                text: 'Count',
            },
            min: 0,
        },
    };

    // Add this helper method to validate dates
    private isValidDate(dateStr: string): boolean {
        if (
            !dateStr ||
            dateStr === 'undefined' ||
            dateStr === 'null' ||
            dateStr === '0000-00-00T00:00:00'
        ) {
            return false;
        }

        // Try parsing the date
        const date = new Date(dateStr);

        // Check if the date is valid and not the Unix epoch (Jan 1 1970)
        return !isNaN(date.getTime()) && date.getTime() !== 0;
    }

    private extractYearsFromData(dataSets: any[][]): string[] {
        const yearSet = new Set<string>();
        const flattened = dataSets.reduce((acc, val) => acc.concat(val), []);
        flattened.forEach((item) => {
            if (this.isValidDate(item.date)) {
                const date = new Date(item.date);
                if (!isNaN(date.getTime())) {
                    yearSet.add(date.getFullYear().toString());
                }
            }
        });
        return Array.from(yearSet).sort();
    }

    onYearChange(event: any): void {
        this.updateChart();
    }
}
