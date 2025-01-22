/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        subtitle: 'Dashboard and analytics',
        type: 'group',
        icon: 'heroicons_outline:chart-pie',
        children: [
            {
                id: 'dashboard',
                title: 'Analytics',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/dashboard',
            },
        ],
    },
    {
        id: 'assets',
        title: 'Assets Details',
        subtitle: 'Asset inventory and details',
        type: 'group',
        icon: 'heroicons_outline:chart-pie',
        children: [
            // {
            //     id: 'dashboard',
            //     title: 'Assets',
            //     type: 'basic',
            //     icon: 'heroicons_outline:desktop-computer',
            //     link: '/dashboard',
            // },
            {
                id: 'assets.equipments',
                title: 'Assets Profile',
                type: 'collapsable',
                icon: 'heroicons_outline:desktop-computer',
                children: [                 
                    {
                        id: 'assets.equitpments.inventory',
                        title: 'Import Inventory',
                        type: 'basic',
                        icon: 'feather:download',
                        link: '/assets/import-assets',
                    },
                ],
            },
            {
                id: 'assets.tables',
                title: 'Asset Details',
                type: 'collapsable',
                icon: 'feather:tag',
                children: [
                    {
                        id: 'assets.cards.details',
                        title: 'Accountability',
                        type: 'collapsable',
                        icon: 'mat_outline:article',         
                        children:[                           
                            {
                                id: 'assets.cards.details.pc',
                                title: 'Accountability Form',
                                type: 'basic',
                                //  icon: 'feather:monitor',
                                link: '/assets/cards/pcs',
                            },
                        ]             
                    },
                    {
                        id: 'assets.cards.details',
                        title: 'Desktop',
                        type: 'collapsable',
                        icon: 'feather:monitor',         
                        children:[                           
                            {
                                id: 'assets.tables.pc',
                                title: 'Desktop Specifications',
                                type: 'basic',
                                // icon: 'feather:monitor',
                                link: '/assets/pc',
                            },
                            // {
                            //     id: 'assets.tables.pc',
                            //     title: 'Desktop Set',
                            //     type: 'basic',
                            //     // icon: 'feather:monitor',
                            //     // link: '/assets/pc',
                            // },
                            // {
                            //     id: 'assets.tables.pc',
                            //     title: 'Laptop Set',
                            //     type: 'basic',
                            //     // icon: 'feather:monitor',
                            //     // link: '/assets/pc',
                            // },
                            // {
                            //     id: 'assets.tables.pc',
                            //     title: 'Laptop Specifications',
                            //     type: 'basic',
                            //     // icon: 'feather:monitor',
                            //     // link: '/assets/pc',
                            // },
                        ]             
                    },
                    {
                        id: 'assets.peripherals.label',
                        title: 'Peripherals',
                        type: 'collapsable',
                        icon: 'mat_outline:devices_other',         
                        children:[                          
                            {
                                id: 'assets.peripherals.specifications',
                                title: 'Peripherals Specification ',
                                type: 'basic',                                
                                link: '/assets/peripherals/specification',
                            },
                            {
                                id: 'assets.peripherals.monitor',
                                title: 'Monitor',
                                type: 'basic',                                
                                link: '/assets/peripherals/monitor',
                            },
                            {
                                id: 'assets.peripherals.mouse',
                                title: 'Mouse',
                                type: 'basic',
                                // icon: 'feather:monitor',
                                // link: '/assets/pc',
                            },
                            // {
                            //     id: 'assets.tables.pc',
                            //     title: 'Keyboard',
                            //     type: 'basic',
                            //     // icon: 'feather:monitor',
                            //     // link: '/assets/pc',
                            // },
                            // {
                            //     id: 'assets.tables.pc',
                            //     title: 'Adapter',
                            //     type: 'basic',
                            //     // icon: 'feather:monitor',
                            //     // link: '/assets/pc',
                            // },
                            // {
                            //     id: 'assets.tables.pc',
                            //    title: 'External Driver',
                            //     type: 'basic',
                            //     // icon: 'feather:monitor',
                            //     // link: '/assets/pc',
                            // },
                            // {
                            //     id: 'assets.tables.pc',
                            //     title: 'Web Camera',
                            //     type: 'basic',
                            //     // icon: 'feather:monitor',
                            //     // link: '/assets/pc',
                            // },
                            // {
                            //     id: 'assets.tables.pc',
                            //     title: 'UPS/AVR',
                            //     type: 'basic',
                            //     // icon: 'feather:monitor',
                            //     // link: '/assets/pc',
                            // },
                            // {
                            //     id: 'assets.tables.pc',
                            //     title: 'Dongle',
                            //     type: 'basic',
                            //     // icon: 'feather:monitor',
                            //     // link: '/assets/pc',
                            // },
                            // {
                            //     id: 'assets.tables.pc',
                            //     title: 'Bag',
                            //     type: 'basic',
                            //     // icon: 'feather:monitor',
                            //     // link: '/assets/pc',
                            // },
                        ]             
                    },
                 
                ],
            },
        ],
    },
    {
        id: 'data',
        title: 'Data Table',
        subtitle: 'Requests and approvals',
        type: 'group',
        icon: 'heroicons_outline:chart-pie',
        children: [
            {
                id: 'data.asset',
                title: 'Asset Movement',
                type: 'collapsable',
                icon: 'heroicons_outline:desktop-computer',
                children: [
                    {
                        id: 'data.asset.table',
                        title: 'Movement',
                        type: 'basic',
                        icon: 'feather:tag',
                        link: '/data/movement',
                    },
                ],
            },
        ],
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
