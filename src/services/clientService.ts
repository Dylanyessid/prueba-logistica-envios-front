import apiClient from '@/lib/apiClient';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const clientService = {
  async getAll(): Promise<Client[]> {
    const response = await apiClient.get<ApiResponse<Client[]>>('/clients');
    return response.data.data;
  },
};

export default clientService;