import apiClient from '@/lib/apiClient';

export interface SeaShipment {
  id: number;
  clientId: number;
  productId: number;
  productName?: string;
  destinationPortId: number;
  destinationPortName?: string;
  productQuantity: number;
  shippingPrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  fleetNumber: string;
  trackingNumber: string;
  registrationDate: string;
  deliveryDate: string;
  clientName?: string;
  clientDocument?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateSeaShipmentData {
  clientId: number;
  productId: number;
  destinationPortId: number;
  productQuantity: number;
  shippingPrice: number;
  fleetNumber: string;
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

export const seaShipmentService = {
  async getAll(): Promise<SeaShipment[]> {
    const response = await apiClient.get<ApiResponse<SeaShipment[]>>('/sea-shipments');
    return response.data.data;
  },

  async getById(id: number): Promise<SeaShipment> {
    const response = await apiClient.get<ApiResponse<SeaShipment>>(`/sea-shipments/${id}`);
    return response.data.data;
  },

  async create(data: CreateSeaShipmentData): Promise<SeaShipment> {
    const response = await apiClient.post<ApiResponse<SeaShipment>>('/sea-shipments', data);
    return response.data.data;
  },

  async update(id: number, data: CreateSeaShipmentData): Promise<SeaShipment> {
    const response = await apiClient.patch<ApiResponse<SeaShipment>>(`/sea-shipments/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/sea-shipments/${id}`);
  },
};

export default seaShipmentService;