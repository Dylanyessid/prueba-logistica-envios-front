import apiClient from '@/lib/apiClient';

export interface Product {
  id: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateProductData {
  name: string;
  description: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const productoService = {
  async getAll(): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products');
    return response.data.data;
  },

  async getById(id: number): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  async create(data: CreateProductData): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.data.data;
  },

  async update(id: number, data: CreateProductData): Promise<Product> {
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};

export default productoService;