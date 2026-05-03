import apiClient from '@/lib/apiClient';

export interface LandShipment {
  id: number;
  clientId: number;
  productId: number;
  productName?: string;
  destinationWarehouseId: number;
  destinationWarehouseName?: string;
  productQuantity: number;
  shippingPrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  vehiclePlate: string;
  trackingNumber: string;
  registrationDate: string;
  deliveryDate: string;
  clientName?: string;
  clientDocument?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateLandShipmentData {
  clientId: number;
  productId: number;
  destinationWarehouseId: number;
  productQuantity: number;
  shippingPrice: number;
  vehiclePlate: string;
  trackingNumber: string;
  registrationDate: string;
  deliveryDate: string;
  discountPercentage?: number;
  discountAmount?: number;
  finalPrice?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const landShipmentService = {
  async getAll(): Promise<LandShipment[]> {
    const response = await apiClient.get<ApiResponse<LandShipment[]>>('/land-shipments');
    return response.data.data;
  },

  async getById(id: number): Promise<LandShipment> {
    const response = await apiClient.get<ApiResponse<LandShipment>>(`/land-shipments/${id}`);
    return response.data.data;
  },

  async create(data: CreateLandShipmentData): Promise<LandShipment> {
    const response = await apiClient.post<ApiResponse<LandShipment>>('/land-shipments', data);
    return response.data.data;
  },

  async update(id: number, data: CreateLandShipmentData): Promise<LandShipment> {
    const response = await apiClient.patch<ApiResponse<LandShipment>>(`/land-shipments/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/land-shipments/${id}`);
  },
};

export default landShipmentService;