import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import type { DynamoKey } from '../types/dynamodb';

const SCAN_ITEMS_QUERY_KEY = ['dynamodb', 'scan-items'];

export function useScanItems(
  tableName: string | null,
  exclusiveStartKey?: DynamoKey,
  enabled = false,
) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();

  const queryKey = [
    ...SCAN_ITEMS_QUERY_KEY,
    endpoint,
    settings.region,
    tableName,
    exclusiveStartKey,
  ];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!tableName) {
        throw new Error('No table name provided');
      }
      const { scanItems } = await import('../api/dynamodb');
      return scanItems({ tableName, exclusiveStartKey }, { endpoint, region: settings.region });
    },
    enabled: !!tableName && enabled,
    staleTime: 10_000,
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: SCAN_ITEMS_QUERY_KEY });

  return {
    items: query.data?.items ?? [],
    lastEvaluatedKey: query.data?.lastEvaluatedKey,
    scannedCount: query.data?.scannedCount,
    loading: query.isLoading,
    error: query.error,
    refetch,
  };
}
