import { useQuery } from '@tanstack/react-query';

import { getFunction } from '../api/lambda';
import { useSettings } from '@/features/settings/hooks/useSettings';

export function useFunction(functionName: string | null) {
  const { endpoint, settings } = useSettings();
  const queryKey = ['lambda', 'function', functionName, endpoint, settings.region];

  const query = useQuery({
    queryKey,
    queryFn: () => (functionName ? getFunction(functionName, { endpoint, region: settings.region }) : Promise.resolve(null)),
    enabled: !!functionName,
    staleTime: 30_000,
  });

  return {
    function: query.data,
    loading: query.isLoading,
    error: query.error,
  };
}