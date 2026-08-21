import { ApiResponse } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  try {
    const data = await res.json();
    return data;
  } catch {
    return {
      success: false,
      message: res.statusText || 'Network request failed',
      errors: ['Failed to parse JSON response from server'],
    };
  }
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<T>(res);
  },

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<T>(res);
  },
};
