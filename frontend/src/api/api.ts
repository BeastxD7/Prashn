import type { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import type {
  ApiResponse,
  DashboardData,
  GenerateQuizByTextPayload,
  GenerateQuizByTextResponse,
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
    },
    getCredits: async (): Promise<AxiosResponse | null> => {
      const res = await apiClient.get<ApiResponse<{ credits: number }>>('users/credits');
      return res;
    }
  },
  dashboard: {
    getData: async (): Promise<AxiosResponse | null> => {
      const res = await apiClient.get<ApiResponse<DashboardData>>(`dashboard`);
      return res;
    },
  },
  quiz: {
    generateByText: async (
      payload: GenerateQuizByTextPayload
    ): Promise<AxiosResponse<GenerateQuizByTextResponse> | null> => {
      const res = await apiClient.post<GenerateQuizByTextResponse>(
        'quiz/generate-quiz-by-text',
        payload
      );
      return res;
    },
    generateByPdf: async (
      formData: FormData
    ): Promise<AxiosResponse<any> | null> => {
      const res = await apiClient.post<any>(
        'quiz/generate-quiz-by-pdf',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res;
    },
    getById: async (id: number): Promise<AxiosResponse<any> | null> => {
      // returns the quiz with questions: { status, quiz, questions, noOfQuestions, creditsCharged }
      const res = await apiClient.get<any>(`get-quiz-by-id/${id}`)
      return res
    },
    // New: fetch quiz by id using query param: get-quiz-by-id?quizId={id}
    getQuizById: async (id: number): Promise<AxiosResponse<any> | null> => {
      const res = await apiClient.get<any>(`quiz/get-quiz-by-id?quizId=${id}`)
      return res
    },
    editQuestions: async (payload: { questions: any[] }): Promise<AxiosResponse<any> | null> => {
      const res = await apiClient.post<any>('quiz/edit-quiz-questions', payload)
      return res
    },
    // Toggle privacy for a quiz (isPublic boolean)
    setPrivacy: async (id: number, payload: { isPublic: boolean }): Promise<AxiosResponse<any> | null> => {
      const res = await apiClient.patch<any>(`quiz/${id}/privacy`, payload)
      return res
    },
    // Toggle whether quiz requires login to access
    setRequireLogin: async (id: number, payload: { requiresLoginkey: boolean }): Promise<AxiosResponse<any> | null> => {
      const res = await apiClient.patch<any>(`quiz/${id}/require-login`, payload)
      return res
    },
  },
};
