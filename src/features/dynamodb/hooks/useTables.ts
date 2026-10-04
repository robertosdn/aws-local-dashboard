import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';

import { listTablesWithDetails } from '../api/dynamodb';
import { useSettings } from '@/features/settings/hooks/useSettings';

const TABLES_QUERY_KEY = ['dynamodb', 'tables'];

export function useTables() {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();

  const query = useInfiniteQuery({
    queryKey: [...TABLES_QUERY_KEY, endpoint, settings.region],
    queryFn: ({ pageParam }) =>
      listTablesWithDetails({ endpoint, region: settings.region }, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.lastEvaluatedTableName,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: TABLES_QUERY_KEY });

  return {
    tables: query.data?.pages.flatMap((page) => page.tables) ?? [],
    lastEvaluatedTableName: query.data?.pages[query.data.pages.length - 1]?.lastEvaluatedTableName,
    hasMore: query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
    loadMore: () => query.fetchNextPage(),
    loading: query.isLoading,
    error: query.error,
    refetch,
  };
}

export function useInvalidateTables() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['dynamodb', 'tables'] });
}

export function useTableDetails(tableName: string | null) {
  const queryClient = useQueryClient();
  const { endpoint, settings } = useSettings();

  const query = useQuery({
    queryKey: ['dynamodb', 'table', tableName, endpoint, settings.region],
    queryFn: () => {
      if (!tableName) throw new Error('No table name provided');
      return import('../api/dynamodb').then((m) =>
        m.describeTable(tableName, { endpoint, region: settings.region }),
      );
    },
    enabled: !!tableName,
    staleTime: 30_000,
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ['dynamodb', 'table', tableName] });

  return {
    tableDetails: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch,
  };
}
