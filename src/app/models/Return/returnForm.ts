interface Component {
    id: number;
    uid: string;
    description: string;
    date_acquired: string;
    asset_barcode: string;
    status: string;
    cost: number;
    componentType?: string; // Added for display purposes
    checked?: boolean;      // Added for the returned checkbox
    condition?: string;     // Added for condition select
    remarks?: string;      // Added for remarks input
}