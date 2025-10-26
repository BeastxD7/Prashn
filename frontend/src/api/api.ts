import type { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import type {
  ApiResponse,
  DashboardData,
  meResponse,
  UserLoginPayload,
  UserRegisterPayload,
  UserResponse,
} from './types';


export const api = {
  user: {
    register: async (user: UserRegisterPayload): Promise<AxiosResponse | null> => {
      const res = await apiClient.post<ApiResponse<UserResponse>>('users/register', user);
      return res;
    },
    login: async (user: UserLoginPayload): Promise<AxiosResponse | null> => {
      const res = await apiClient.post<ApiResponse<UserResponse>>('users/login', user);
      return res;
    },
    logout: async (): Promise<AxiosResponse | null> => {
      const res = await apiClient.post<ApiResponse<UserResponse>>('users/logout');
      return res;
    },
    me: async (): Promise<AxiosResponse | null> => {
      const res = await apiClient.get<ApiResponse<meResponse>>('users/me');
      return res;
    }
  },
  dashboard: {
    getData: async (): Promise<AxiosResponse | null> => {
      const res = await apiClient.get<ApiResponse<DashboardData>>(`dashboard`);
      return res;
    },
  },
};
