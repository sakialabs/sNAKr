import axios, { AxiosInstance, AxiosError } from 'axios';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !session) {
            // Refresh failed, logout user
            await supabase.auth.signOut();
            return Promise.reject(error);
          }
          // Retry original request with new token
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${session.access_token}`;
            return this.client.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Households
  async getHouseholds() {
    const response = await this.client.get('/households');
    return response.data;
  }

  async createHousehold(name: string) {
    const response = await this.client.post('/households', { name });
    return response.data;
  }

  // Items
  async getItems(householdId: string, filters?: { location?: string; state?: string }) {
    const response = await this.client.get(`/households/${householdId}/items`, { params: filters });
    return response.data;
  }

  async createItem(householdId: string, item: any) {
    const response = await this.client.post(`/households/${householdId}/items`, item);
    return response.data;
  }

  async updateItem(itemId: string, updates: any) {
    const response = await this.client.patch(`/items/${itemId}`, updates);
    return response.data;
  }

  async deleteItem(itemId: string) {
    await this.client.delete(`/items/${itemId}`);
  }

  // Quick actions
  async markItemUsed(itemId: string) {
    const response = await this.client.post(`/items/${itemId}/used`);
    return response.data;
  }

  async markItemRestocked(itemId: string) {
    const response = await this.client.post(`/items/${itemId}/restocked`);
    return response.data;
  }

  async markItemRanOut(itemId: string) {
    const response = await this.client.post(`/items/${itemId}/ran_out`);
    return response.data;
  }

  // Receipts
  async uploadReceipt(householdId: string, file: any) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post(`/households/${householdId}/receipts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getReceipt(receiptId: string) {
    const response = await this.client.get(`/receipts/${receiptId}`);
    return response.data;
  }

  async confirmReceipt(receiptId: string, items: any[]) {
    const response = await this.client.post(`/receipts/${receiptId}/confirm`, { items });
    return response.data;
  }

  // Restock list
  async getRestockList(householdId: string) {
    const response = await this.client.get(`/households/${householdId}/restock`);
    return response.data;
  }

  async dismissRestockItem(itemId: string, days: number) {
    const response = await this.client.post(`/restock/${itemId}/dismiss`, { days });
    return response.data;
  }

  // Events
  async getEvents(householdId: string, filters?: { itemId?: string; type?: string }) {
    const response = await this.client.get(`/households/${householdId}/events`, { params: filters });
    return response.data;
  }
}

export const api = new ApiClient();
