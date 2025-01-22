import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import ApexCharts from 'apexcharts';

@Component({
    selector: 'example',
    templateUrl: './example.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ExampleComponent {
    /**
     * Constructor
     */
    constructor() {}


    // Mock data
    data = {
        conversions: {
            amount: 1200,
        },
        impressions: {
            amount: 30000,
        },
        visits: {
            amount: 15000,
        },
    };

    chartVisitors = {
        chart: {
            animations: {
                speed: 400,
                animateGradually: {
                    enabled: false,
                },
            },
            fontFamily: 'inherit',
            foreColor: 'inherit',
            //   width: '100%',
            height: '100%',
            type: 'area',
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
            sparkline: {
                enabled: true, // Enable sparkline for small screens
            },
        },
        colors: ['#818CF8'],
        fill: {
            colors: ['#312E81'],
            opacity: 0.5, // Set opacity for the area
        },
        grid: {
            show: true,
            borderColor: '#334155',
            padding: {
                // top: 10,
                // bottom: -35,
                // left: -28,
                // right: -10,
            },
            position: 'back',
            xaxis: {
                lines: {
                    show: true,
                },
            },
        },
        series: [
            {
                name: 'Visitors',
                data: [
                    { x: new Date('2024-01-01').getTime(), y: 2000 },
                    { x: new Date('2024-02-01').getTime(), y: 2200 },
                    { x: new Date('2024-03-01').getTime(), y: 2500 },
                    { x: new Date('2024-04-01').getTime(), y: 3000 },
                    { x: new Date('2024-05-01').getTime(), y: 2800 },
                    { x: new Date('2024-06-01').getTime(), y: 3500 },
                    { x: new Date('2024-07-01').getTime(), y: 3700 },
                ],
            },
        ],
        stroke: {
            width: 2,
            curve: 'smooth', // Keep smooth curve for responsive behavior
        },
        tooltip: {
            followCursor: true,
            theme: 'dark',
            x: {
                format: 'MMM dd, yyyy',
            },
            y: {
                formatter: (value: number): string => `${value}`,
            },
        },
        xaxis: {
            type: 'datetime',
            labels: {
                format: 'MMM dd',
                style: {
                    colors: '#CBD5E1',
                },
            },
            tickAmount: 7,
            tooltip: {
                enabled: true,
            },
        },
        yaxis: {
            axisTicks: {
                show: false,
            },
            axisBorder: {
                show: false,
            },
            labels: {
                show: false,
            },
            //   min: (min) => min - 750,
            //   max: (max) => max + 250,
            tickAmount: 5,
        },
        responsive: [
            {
                // breakpoint: 768, // Breakpoint for medium devices
                options: {
                    chart: {
                        sparkline: {
                            enabled: true, // Enable sparkline mode for medium screens
                        },
                    },
                    grid: {
                        padding: {
                            left: 0,
                            right: 0,
                        },
                    },
                },
            },
            {
                // breakpoint: 480, // Breakpoint for mobile devices
                options: {
                    chart: {
                        sparkline: {
                            enabled: true, // Enable sparkline for small screens
                        },
                    },
                    xaxis: {
                        labels: {
                            show: false, // Hide x-axis labels on mobile for better spacing
                        },
                    },
                    yaxis: {
                        labels: {
                            show: false, // Hide y-axis labels for mobile view
                        },
                    },
                },
            },
        ],
    };

    // Chart configurations for conversions
    chartConversions = {
        chart: {
            animations: {
                enabled: false, // Disable animations
            },
            fontFamily: 'inherit', // Inherit font family
            foreColor: 'inherit', // Inherit text color
            height: '100%', // Set chart height to 100%
            type: 'bar', // Keep chart type as bar
            sparkline: {
                enabled: true, // Enable sparkline mode
            },
            toolbar: {
                show: false, // Hide toolbar
            },
        },
        colors: ['#FF4560'], // Updated color for the bars
        fill: {
            colors: ['#FF4560'], // Fill color for the bars
            opacity: 0.5, // Set opacity for the fill
        },
        series: [
            {
                name: 'Conversions', // Name of the series
                data: [1000, 1100, 950, 1200, 1150, 1300, 1250], // Use your data for conversions
            },
        ],
        stroke: {
            width: 2, // Keep the stroke width
        },
        tooltip: {
            followCursor: true, // Tooltip follows the cursor
            theme: 'dark', // Set tooltip theme to dark
        },
        xaxis: {
            type: 'category', // Set x-axis type to category
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], // Keep your month categories
        },
        yaxis: {
            labels: {
                formatter: (val) => val.toString(), // Format y-axis labels as strings
            },
            title: {
                text: 'Number of Conversions', // Title for the Y-axis
            },
        },
    };

    // Chart configurations for impressions
    chartImpressions = {
        chart: {
            animations: {
                enabled: false, // Disable animations
            },
            fontFamily: 'inherit', // Inherit font family
            foreColor: 'inherit', // Inherit text color
            height: '100%', // Set chart height to 100%
            type: 'area', // Set chart type to area
            sparkline: {
                enabled: true, // Enable sparkline mode
            },
            toolbar: {
                show: false, // Hide toolbar
            },
        },
        colors: ['#34D399'], // Updated color for the area
        fill: {
            colors: ['#34D399'], // Fill color for the area
            opacity: 0.5, // Set opacity for the fill
        },
        series: [
            {
                name: 'Impressions',
                data: [15000, 20000, 25000, 30000, 27000, 32000, 35000], // Use your data for impressions
            },
        ],
        stroke: {
            curve: 'smooth', // Keep smooth stroke curve
        },
        tooltip: {
            followCursor: true, // Tooltip follows the cursor
            theme: 'dark', // Set tooltip theme to dark
        },
        xaxis: {
            type: 'category', // Set x-axis type to category
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], // Keep your month categories
        },
        yaxis: {
            labels: {
                formatter: (val) => val.toString(), // Format y-axis labels as strings
            },
            title: {
                text: 'Number of Impressions', // Title for the Y-axis
            },
        },
    };

    // Chart configurations for visits
    chartVisits = {
        chart: {
            animations: {
                enabled: false, // Disable animations
            },
            fontFamily: 'inherit', // Inherit font family
            foreColor: 'inherit', // Inherit text color
            height: '100%', // Set chart height to 100%
            type: 'area', // Set chart type to area
            sparkline: {
                enabled: true, // Enable sparkline mode
            },
            toolbar: {
                show: false, // Hide toolbar
            },
        },
        colors: ['#FB7185'], // Updated color for the area
        fill: {
            colors: ['#FB7185'], // Fill color for the area
            opacity: 0.5, // Set opacity for the fill
        },
        series: [
            {
                name: 'Visits', // Name of the series
                data: [12000, 13000, 11500, 14000, 14500, 15000, 16000], // Use your data for visits
            },
        ],
        stroke: {
            curve: 'smooth', // Keep smooth stroke curve
        },
        tooltip: {
            followCursor: true, // Tooltip follows the cursor
            theme: 'dark', // Set tooltip theme to dark
        },
        xaxis: {
            type: 'category', // Set x-axis type to category
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], // Keep your month categories
        },
        yaxis: {
            labels: {
                formatter: (val) => val.toString(), // Format y-axis labels as strings
            },
            title: {
                text: 'Number of Visits', // Title for the Y-axis
            },
        },
    };
}
