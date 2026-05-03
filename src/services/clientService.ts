import apiClient from '@/lib/apiClient';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClientDto {
  email: string;
  name: string;
  password: string;
  phone: string;
  document: string;
  address: string;
}

export interface UpdateClientDto {
  email?: string;
  name?: string;
  password?: string;
  phone?: string;
  document?: string;
  address?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const clientService = {
  async getAll(): Promise<Client[]> {
    const response = await apiClient.get<ApiResponse<Client[]>>('/users/clients');
    return response.data.data;
  },

  async getById(id: number): Promise<Client> {
    const response = await apiClient.get<ApiResponse<Client>>(`/users/clients/${id}`);
    return response.data.data;
  },

  async create(data: CreateClientDto): Promise<Client> {
    const response = await apiClient.post<ApiResponse<Client>>('/users/clients', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateClientDto): Promise<Client> {
    const response = await apiClient.patch<ApiResponse<Client>>(`/users/clients/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/users/clients/${id}`);
  },
};

export default clientService;