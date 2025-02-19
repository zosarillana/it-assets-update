export interface Assets {
    id: number;
    type: string;
    date_acquired: string;
    asset_barcode: string;
    brand: string;
    model: string;
    ram: string | null;
    ssd: string | null;
    hdd: string | null;
    gpu: string | null;
    values: [];
    size: string | null;
    color: string;
    serial_no: string | null;
    po: string | null;
    warranty: string | null;
    cost: number;
    remarks: string | null;
    li_description: string;
    history: {
        $values: string[];
    };
    asset_image: string | null;
    owner_id: number;
    is_deleted: boolean;
    date_created: string;
    date_modified: string | null;
    assigned_assets?: string;  // Add this if missing
    peripheral_type?: string;  // Add this if missing
}