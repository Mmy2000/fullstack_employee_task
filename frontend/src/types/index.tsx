// User and Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "manager" | "employee";
  first_name?: string;
  last_name?: string;
}

export interface ChangePasswordData {
  old_password:string,
  new_password:string,
  confirm_password:string
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: "admin" | "manager" | "employee";
  first_name?: string;
  last_name?: string;
}

export interface UpdateRequest {
  username: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  message: string;
    user: User;
    tokens: {
        access: string;
        refresh: string;
    };
}

// Company Types
export interface Company {
  id: number;
  company_name: string;
  number_of_departments: number;
  number_of_employees: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyDetails {
  id: number;
  company_name: string;
  number_of_departments: number;
  number_of_employees: number;
  departments: DepartmentDetails[];
  created_at: string;
  updated_at: string;
}

export interface CompanyFormData {
  company_name: string;
}


// Department Types
export interface Department {
  id: number;
  company: number;
  company_name: string;
  department_name: string;
  number_of_employees: number;
  created_at: string;
  updated_at: string;
}

export interface DepartmentDetails {
  id: number;
  company: number;
  company_name: string;
  department_name: string;
  number_of_employees: number;
  employees: Employee[];
  created_at: string;
  updated_at: string;
}

export interface DepartmentFormData {
  company: number;
  department_name: string;
}

// Employee Types
export type EmployeeStatus =
  | "application_received"
  | "interview_scheduled"
  | "hired"
  | "not_accepted";

export interface Employee {
  id: number;
  company: number;
  company_name: string;
  department: number | null;
  department_name: string | null;
  employee_status: EmployeeStatus;
  employee_name: string;
  email_address: string;
  mobile_number: string;
  address: string;
  designation: string;
  hired_on: string | null;
  days_employed: number | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeFormData {
  company: number;
  department: number | null;
  employee_status: EmployeeStatus;
  employee_name: string;
  email_address: string;
  mobile_number: string;
  address: string;
  designation: string;
  hired_on: string | null;
}

export interface EmployeeReportData {
  employee_name: string;
  email_address: string;
  mobile_number: string;
  position: string;
  hired_on: string;
  days_employed: number;
  company_name: string;
  department_name: string;
}

// Dashboard Types
export interface DashboardSummary {
  total_companies: number;
  total_departments: number;
  total_employees: number;
  hired_employees: number;
  pending_applications: number;
  scheduled_interviews: number;
}

// API Error Types
export interface APIError {
  error: string;
  details?: Record<string, string[]>;
}

// Filter and Pagination Types
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface EmployeeFilters {
  company?: number;
  department?: number;
  status?: EmployeeStatus;
}

export interface DepartmentFilters {
  company?: number;
}

// Status Badge Types
export const STATUS_COLORS: Record<EmployeeStatus, string> = {
  application_received: "bg-blue-100 text-blue-800",
  interview_scheduled: "bg-yellow-100 text-yellow-800",
  hired: "bg-green-100 text-green-800",
  not_accepted: "bg-red-100 text-red-800",
};

export const STATUS_LABELS: Record<EmployeeStatus, string> = {
  application_received: "Application Received",
  interview_scheduled: "Interview Scheduled",
  hired: "Hired",
  not_accepted: "Not Accepted",
};

// Workflow Transition Types
export const VALID_TRANSITIONS: Record<EmployeeStatus, EmployeeStatus[]> = {
  application_received: ["interview_scheduled", "not_accepted"],
  interview_scheduled: ["hired", "not_accepted"],
  hired: ["hired"],
  not_accepted: ["not_accepted"],
};
