import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/features/settings/hooks/useSettings';
import type { DynamoKey, SortKeyCondition, DynamoKeyValue } from '../types/dynamodb';

const QUERY_ITEMS_QUERY_KEY = ['dynamodb', 'query-items'];

export function useQueryItems(
  tableName: string | null,
  partitionKeyValue: DynamoKeyValue | undefined,
  sortKeyCondition: SortKeyCondition | undefined,
  exclusiveStartKey?: DynamoKey,
) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();

  const queryKey = [
    ...QUERY_ITEMS_QUERY_KEY,
    endpoint,
    settings.region,
    tableName,
    partitionKeyValue,
    sortKeyCondition,
    exclusiveStartKey,
  ];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!tableName || partitionKeyValue === undefined) {
        throw new Error('Missing required query parameters');
      }
      const { queryItems } = await import('../api/dynamodb');
      return queryItems(
        {
          tableName,
          partitionKeyValue,
          sortKeyCondition,
          exclusiveStartKey,
        },
        { endpoint, region: settings.region },
      );
    },
    enabled: !!tableName && partitionKeyValue !== undefined,
    staleTime: 10_000,
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: QUERY_ITEMS_QUERY_KEY });

  return {
    items: query.data?.items ?? [],
    lastEvaluatedKey: query.data?.lastEvaluatedKey,
    scannedCount: query.data?.scannedCount,
    loading: query.isLoading,
    error: query.error,
    refetch,
  };
}
