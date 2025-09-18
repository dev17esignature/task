import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';
import { api } from './api';


type EnhancedQueryConfig<T> = {
  url: string;
  method?: AxiosRequestConfig['method'];
  params?: Record<string, any>;
  headers?: Record<string, any>;
  data?: unknown;
};

export function useCustomQuery<TResponse>(
  config: EnhancedQueryConfig<TResponse>,
  queryKey: unknown[],
  options?: UseQueryOptions<TResponse>
) {
  return useQuery<TResponse>({
    queryKey,
    queryFn: async () => {
      const response = await api.request<TResponse>({
        method: config.method || 'GET',
        url: config.url,
        params: config.params,
        headers: config.headers,
        data: config.data,
      });
      return response.data;
    },
    ...options,
  });
}