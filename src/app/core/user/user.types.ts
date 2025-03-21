export interface User {
    id: string;
    employee_id: string;
    name: string;
    email: string;
    designation?: string; // Add this if missing
    role?: string;
    company?: string;
    department?: string;
    avatar?: string;
    status?: string;
    prepared_date?: string;
    
}
