import { useQuery, useQueryClient } from '@tanstack/react-query';

import { listFunctions } from '../api/lambda';
import { useSettings } from '@/features/settings/hooks/useSettings';

const FUNCTIONS_QUERY_KEY = ['lambda', 'functions'];

export function useFunctions() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();
  const queryKey = [...FUNCTIONS_QUERY_KEY, endpoint, settings.region];

  const query = useQuery({
    queryKey,
    queryFn: () => listFunctions({ endpoint, region: settings.region }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: FUNCTIONS_QUERY_KEY });

  return {
    functions: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch,
  };
}

export function useInvalidateFunctions() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['lambda', 'functions'] });
}