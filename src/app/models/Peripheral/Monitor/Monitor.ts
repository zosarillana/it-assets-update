export class Monitor {
    id?: number;
    model = '';
    size = '';
    color = '';    
    brand = '';
    status = '';
    assigned = '';
    user_history = '';
    set_history = '';
    // li_description = '';   
    acquired_date = '';
    asset_barcode = '';
    serial_no = '';
    date_created = '';
    date_updated = '';   
    assignedUsers: Array<{
        id: number;
        first_name: number;
        middle_name: string;
        last_name: string;
        emp_id: string;
        contact_no: string;
        position: string;
        dept_name: string;
        company_name: string;
        date_created: string;
        date_updated: string;        
    }> = [];
    userHistory: Array<{
        id: number;
        first_name: number;
        middle_name: string;
        last_name: string;
        emp_id: string;
        contact_no: string;
        position: string;
        dept_name: string;
        company_name: string;
        date_created: string;
        date_updated: string;        
    }> = [];
    setHistory: Array<{
        id: number;      
        brand: string;
        model: string;
        processor: string;
        ram: string;
        storage_capacity: string;
        storage_type: string;
        operating_system: string;
        graphics: string;
        status: string;
        assigned: string;
        li_description:string,
        user_history: string;
        acquired_date: string;
        asset_barcode: string;
        serial_no: string;
        date_created: string;
        date_updated: string;
    }> = [];
  }
  