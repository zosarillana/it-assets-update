export interface Owner {
  id: number;
  name: string;
  company: string;
  department: string;
  employee_id: string;
}

export interface Asset {
  id: number;
  type: string;
  date_acquired: string;
  asset_barcode: string;
  brand: string;
  model: string;
  ram: string;
  ssd: string;
  hdd: string;
  gpu: string;
  size: string;
  color: string;
  serial_no: string;
  po: string;
  warranty: string;
  cost: number;
  remarks: string;
  li_description: string;
  history: string[];
  asset_image: string;
  owner_id: number;
  is_deleted: boolean;
  date_created: string; // ISO date string
  date_modified: string; // ISO date string
  owner: Owner;
}

export interface Accountability {
  id: number;
  accountability_code: string;
  tracking_code: string;
  owner_id: number;
  owner: Owner;
  assets: Asset[];
}
