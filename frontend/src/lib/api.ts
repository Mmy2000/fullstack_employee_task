import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { 
  User, LoginRequest, RegisterRequest, AuthResponse,
  Company, CompanyFormData,
  Department, DepartmentFormData, DepartmentFilters,
  Employee, EmployeeFormData, EmployeeFilters, EmployeeReportData,
  DashboardSummary, APIError,
  UpdateRequest,
  ChangePasswordData,
  CompanyDetails,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle new response structure and errors
apiClient.interceptors.response.use(
  (response) => {
    // Extract data from new response structure
    // Response format: { data: {...}, message: "...", status_code: 200 }
    if (response.data && typeof response.data === 'object') {
      if ('data' in response.data) {
        // Keep the original response but make data easily accessible
        return {
          ...response,
          data: response.data.data,
          message: response.data.message,
          statusCode: response.data.status_code,
        };
      }
    }
    return response;
  },
  async (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleAPIError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Handle new response structure error format
    
    const responseData = error.response?.data;
    
    if (responseData?.message) {
      return responseData.message;
    }
    
    if (responseData?.error) {
      return responseData.error;
    }
    
    // Handle validation errors
    if (responseData?.errors) {
      const firstError = Object.values(responseData.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : String(firstError);
    }
    
    return error.message || 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};

// Authentication APIs
export const authAPI = {
  register: async (data: RegisterRequest): Promise<{ message: string; user: User }> => {
    const response = await apiClient.post('/accounts/api/register/', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/accounts/api/login/', data);
    return response.data;
  },

  updateData: async (data:UpdateRequest) : Promise<User> => {
    const response = await apiClient.patch<User>('/accounts/api/user/update/',data);
    return response.data
  },

  changePassword:async (data:ChangePasswordData) : Promise<{message:string}> => {
    const response = await apiClient.put('/accounts/api/user/change_password/',data)
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/accounts/api/user/');
    return response.data;
  },
};

// Company APIs
export const companyAPI = {
  getAll: async (): Promise<Company[]> => {
    const response = await apiClient.get<Company[]>('/api/companies/');
    return response.data;
  },

  getById: async (id: number): Promise<CompanyDetails> => {
    const response = await apiClient.get<CompanyDetails>(`/api/companies/${id}/`);    
    return response.data;
  },

  create: async (data: CompanyFormData): Promise<Company> => {
    const response = await apiClient.post<Company>('/api/companies/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CompanyFormData>): Promise<Company> => {
    const response = await apiClient.patch<Company>(`/api/companies/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/companies/${id}/`);
  },
};

// Department APIs
export const departmentAPI = {
  getAll: async (filters?: DepartmentFilters): Promise<Department[]> => {
    const params = new URLSearchParams();
    if (filters?.company) {
      params.append('company', filters.company.toString());
    }
    const response = await apiClient.get<Department[]>(`/api/departments/?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Department> => {
    const response = await apiClient.get<Department>(`/api/departments/${id}/`);
    return response.data;
  },

  create: async (data: DepartmentFormData): Promise<Department> => {
    const response = await apiClient.post<Department>('/api/departments/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<DepartmentFormData>): Promise<Department> => {
    const response = await apiClient.patch<Department>(`/api/departments/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/departments/${id}/`);
  },
};

// Employee APIs
export const employeeAPI = {
  getAll: async (filters?: EmployeeFilters): Promise<Employee[]> => {
    const params = new URLSearchParams();
    if (filters?.company) {
      params.append('company', filters.company.toString());
    }
    if (filters?.department) {
      params.append('department', filters.department.toString());
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    const response = await apiClient.get<Employee[]>(`/api/employees/?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await apiClient.get<Employee>(`/api/employees/${id}/`);
    
    return response.data;
  },

  create: async (data: EmployeeFormData): Promise<Employee> => {
    const response = await apiClient.post<Employee>('/api/employees/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<EmployeeFormData>): Promise<Employee> => {
    const response = await apiClient.patch<Employee>(`/api/employees/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/employees/${id}/`);
  },

  getReport: async (): Promise<EmployeeReportData[]> => {
    const response = await apiClient.get<EmployeeReportData[]>('/api/employees/report/');
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>('/api/dashboard/');
    return response.data;
  },
};

export default apiClient;