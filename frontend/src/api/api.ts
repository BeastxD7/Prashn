import type { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import type {
  ApiResponse,
  UserRegisterPayload,
  UserResponse,
} from './types';


export const api = {
  user: {
    register: async (user: UserRegisterPayload): Promise<AxiosResponse | null> => {
      const res = await apiClient.post<ApiResponse<UserResponse>>('users/register', user);
      console.log("djankdbajkdak");
      
      console.log(res);
      
      return res;
    },
  },
};
