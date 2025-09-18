import { DefaultError, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { api } from './api';


export function useCustomMutations<
  TResponse,
  TVariables,
  TError = DefaultError
>(
  mutationFn: (client: AxiosInstance, variables: TVariables) => Promise<TResponse>,
  options?: UseMutationOptions<TResponse, TError, TVariables>
) {
  return useMutation<TResponse, TError, TVariables>({
    mutationFn: (variables) => mutationFn(api, variables),
    ...options,
  });
}