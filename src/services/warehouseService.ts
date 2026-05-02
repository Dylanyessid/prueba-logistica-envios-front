import apiClient from '@/lib/apiClient';

export interface Warehouse {
  id: number;
  name: string;
  address: string;
  country: string;
  city: string;
  capacity: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateWarehouseData {
  name: string;
  address: string;
  country: string;
  city: string;
  capacity: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const warehouseService = {
  async getAll(): Promise<Warehouse[]> {
    const response = await apiClient.get<ApiResponse<Warehouse[]>>('/warehouses');
    return response.data.data;
  },

  async getById(id: number): Promise<Warehouse> {
    const response = await apiClient.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);
    return response.data.data;
  },

  async create(data: CreateWarehouseData): Promise<Warehouse> {
    const response = await apiClient.post<ApiResponse<Warehouse>>('/warehouses', data);
    return response.data.data;
  },

  async update(id: number, data: CreateWarehouseData): Promise<Warehouse> {
    const response = await apiClient.patch<ApiResponse<Warehouse>>(`/warehouses/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/warehouses/${id}`);
  },
};

export default warehouseService;