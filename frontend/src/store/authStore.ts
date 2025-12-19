import { ChangePasswordData } from './../types/index';
import { create } from 'zustand';
import { User, LoginRequest, RegisterRequest, UpdateRequest } from '@/types';
import { authAPI, handleAPIError } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
  updateUser:(data:UpdateRequest) => void;
  ChangePassword:(data:ChangePasswordData) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authAPI.login(credentials);      
      
      // Store tokens and user
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      document.cookie = `access_token=${response.tokens.access}; path=/; max-age=${5 * 60 * 60}`; // 5 hours

      set({ 
        user: response.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ 
        error: errorMessage, 
        isLoading: false, 
        isAuthenticated: false 
      });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      set({ isLoading: true, error: null });
      await authAPI.register(data);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    set({ 
      user: null, 
      isAuthenticated: false, 
      error: null 
    });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        set({ isAuthenticated: false, user: null });
        return;
      }

      // Verify token is still valid by fetching current user
      const user = await authAPI.getCurrentUser();
      
      set({ 
        user, 
        isAuthenticated: true 
      });
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      set({ 
        user: null, 
        isAuthenticated: false 
      });
    }
  },

  updateUser: async(data:UpdateRequest)=>{
    try{
      set({isLoading:true,error:null})
      const response = await authAPI.updateData(data)
      set({isLoading:false,user:response})
    }catch (error){
      const errorMessage = handleAPIError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  ChangePassword:async(data:ChangePasswordData) => {
    try {
      set({isLoading:true,error:null})
      await authAPI.changePassword(data)
      set({isLoading:false})
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));