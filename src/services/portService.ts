import apiClient from '@/lib/apiClient';

export interface Port {
  id: number;
  name: string;
  country: string;
  city: string;
  type: 'national' | 'international';
  createdAt?: string;
  updatedAt?: string;
}

interface CreatePortData {
  name: string;
  country: string;
  city: string;
  type: 'national' | 'international';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const portService = {
  async getAll(): Promise<Port[]> {
    const response = await apiClient.get<ApiResponse<Port[]>>('/ports');
    return response.data.data;
  },

  async getById(id: number): Promise<Port> {
    const response = await apiClient.get<ApiResponse<Port>>(`/ports/${id}`);
    return response.data.data;
  },

  async create(data: CreatePortData): Promise<Port> {
    const response = await apiClient.post<ApiResponse<Port>>('/ports', data);
    return response.data.data;
  },

  async update(id: number, data: CreatePortData): Promise<Port> {
    const response = await apiClient.patch<ApiResponse<Port>>(`/ports/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/ports/${id}`);
  },
};

export default portService;