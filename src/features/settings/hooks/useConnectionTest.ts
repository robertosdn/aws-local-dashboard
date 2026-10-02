import { useMutation } from '@tanstack/react-query';

import { testConnection } from '../api/testConnection';

interface ConnectionTestInput {
  endpoint: string;
  region: string;
}

export function useConnectionTest() {
  const mutation = useMutation({
    mutationFn: ({ endpoint, region }: ConnectionTestInput) => testConnection(endpoint, region),
  });

  return {
    test: mutation.mutateAsync,
    status: mutation.status,
    error: mutation.error,
    reset: mutation.reset,
  };
}