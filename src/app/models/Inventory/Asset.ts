export interface Assets {
    id: number;
    type: string;
    description: string;
    date_acquired: string;
    asset_barcode: string;
    uid: string;
    brand: string;
    model: string;
    ram: string | null;
    ssd: string | null;
    hdd: string | null;
    gpu: string | null;
    board: string | null;    
    values: [
        $values: string | null
    ];
    size: string | null;
    color: string;
    active_user: string | null;
    bu: string | null;
    status: string | null;
    serial_no: string | null;
    po: string | null;
    warranty: string | null;
    cost: number;
    remarks: string | null;
    li_description: string;
    history: {
        $values: string[];
    };
    asset_ids: string;
    asset_image: string | null;
    owner_id: number;
    is_deleted: boolean;
    date_created: string;
    date_modified: string | null;
    actove_user: string | null
    assigned_assets?: string;  // Add this if missing
    peripheral_type?: string;  // Add this if missing
    fa_code?: string;  // Add this if missing
}