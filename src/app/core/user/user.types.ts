export interface User {
    id: string;
    employee_id: string;
    name: string;
    email: string;
    designation?: string; // Add this if missing
    company?: string;
    department?: string;
    avatar?: string;
    status?: string;
}
