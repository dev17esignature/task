
import axios from 'axios';
import { BASE_URL } from './url';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Apiversion': 'v3',
    'Appversioncode': process.env.EXPO_PUBLIC_APP_VERSION_CODE || '56',
    'Orgid': process.env.EXPO_PUBLIC_ORG_ID || '614',
    'Apikey': process.env.EXPO_PUBLIC_API_KEY || 'de3f1c39f8c03a3401303fdeb9748668',
  },
});

api.interceptors.request.use((config) => {
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (__DEV__) {
    console.error(` API Error:`, {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
  }
  return Promise.reject(error);
});