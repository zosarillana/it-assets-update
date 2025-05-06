export interface User {
    id: number;
    name: string;
    company: string;
    department: string;
    designation: string | null;
    date_created: string;
    date_hired: string;
    date_resignation: string;
    e_signature: string | null;
    employee_id: string | null;
    is_active: boolean;
    password: string | null;
    role: string | null;
}
