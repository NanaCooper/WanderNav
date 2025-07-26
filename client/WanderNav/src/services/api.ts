// src/services/apiService.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://10.194.56.250:8080'; // Default for Android Emulator

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --- Define types for better code intelligence ---

// For Search
export interface SearchApiRequest {
  query: string;
  type: 'places' | 'users' | 'hazards';
  latitude?: number;
  longitude?: number;
}

export interface SearchApiResponseItem {
  id: string;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  username?: string;
  hazardType?: string;
}

// For Weather
export interface WeatherApiParams {
  latitude: number;
  longitude: number;
}

export interface WeatherApiResponse {
  temp: number;
  description: string;
  icon: string;
  locationName?: string;
  humidity?: number;
  windSpeed?: number;
}

// --- API Functions ---

export const searchApiService = {
  performSearch: async (params: SearchApiRequest): Promise<SearchApiResponseItem[]> => {
    try {
      console.log('Sending search request to backend:', params);
      const response = await apiClient.post<SearchApiResponseItem[]>('/api/search', params);
      console.log('Received search response from backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error - performSearch:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Backend search error response:', error.response.data);
      }
      throw error;
    }
  },
};

export const weatherApiService = {
  getWeather: async (params: WeatherApiParams): Promise<WeatherApiResponse> => {
    try {
      console.log('Sending weather request to backend:', params);
      const response = await apiClient.get<WeatherApiResponse>('/api/weather', { params });
      console.log('Received weather response from backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error - getWeather:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Backend weather error response:', error.response.data);
      }
      throw error;
    }
  },
};

// Auth API functions
export const authApiService = {
  register: async (username: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (username: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
};