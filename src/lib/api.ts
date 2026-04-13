const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiError {
  error: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    api.post<{
      success: boolean;
      message: string;
      token: string;
      user: { id: number; username: string; full_name: string; role: string };
    }>('/auth/login', { username, password }),

  getProfile: () =>
    api.get<{ success: boolean; user: any }>('/auth/profile'),

  changePassword: (old_password: string, new_password: string) =>
    api.post<{ success: boolean; message: string }>('/auth/change-password', {
      old_password,
      new_password,
    }),
};

// Barang API
export const barangApi = {
  getAll: () =>
    api.get<{ success: boolean; data: any[] }>('/barang'),

  getById: (id: number) =>
    api.get<{ success: boolean; data: any }>(`/barang/${id}`),

  create: (data: any) =>
    api.post<{ success: boolean; message: string; data: any }>('/barang', data),

  update: (id: number, data: any) =>
    api.put<{ success: boolean; message: string; data: any }>(`/barang/${id}`, data),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/barang/${id}`),
};

// Supplier API
export const supplierApi = {
  getAll: () =>
    api.get<{ success: boolean; data: any[] }>('/supplier'),

  getById: (id: number) =>
    api.get<{ success: boolean; data: any }>(`/supplier/${id}`),

  create: (data: any) =>
    api.post<{ success: boolean; message: string; data: any }>('/supplier', data),

  update: (id: number, data: any) =>
    api.put<{ success: boolean; message: string; data: any }>(`/supplier/${id}`, data),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/supplier/${id}`),
};

// Transaksi Masuk API
export const transaksiMasukApi = {
  getAll: () =>
    api.get<{ success: boolean; data: any[] }>('/transaksi-masuk'),

  getById: (id: number) =>
    api.get<{ success: boolean; data: any }>(`/transaksi-masuk/${id}`),

  create: (data: any) =>
    api.post<{ success: boolean; message: string; data: any }>('/transaksi-masuk', data),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/transaksi-masuk/${id}`),

  getStatistics: () =>
    api.get<{ success: boolean; data: any }>('/transaksi-masuk/statistics/summary'),
};

// Transaksi Keluar API
export const transaksiKeluarApi = {
  getAll: () =>
    api.get<{ success: boolean; data: any[] }>('/transaksi-keluar'),

  getById: (id: number) =>
    api.get<{ success: boolean; data: any }>(`/transaksi-keluar/${id}`),

  create: (data: any) =>
    api.post<{ success: boolean; message: string; data: any }>('/transaksi-keluar', data),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/transaksi-keluar/${id}`),

  getStatistics: () =>
    api.get<{ success: boolean; data: any }>('/transaksi-keluar/statistics/summary'),
};

// Dashboard API
export const dashboardApi = {
  getStatistics: () =>
    api.get<{
      success: boolean;
      data: {
        summary: {
          total_barang: number;
          total_stok: number;
          barang_masuk_bulan_ini: number;
          barang_keluar_bulan_ini: number;
        };
        top_products: any[];
        monthly_statistics: any[];
      };
    }>('/dashboard/statistics'),
};
