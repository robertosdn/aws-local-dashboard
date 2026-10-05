// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteItem,
  deleteTable,
  listTablesWithDetails,
  queryItems,
  scanItems,
} from '@/features/dynamodb/api/dynamodb';
import { useDeleteItem } from '@/features/dynamodb/hooks/useDeleteItem';
import { useDeleteTable } from '@/features/dynamodb/hooks/useDeleteTable';
import { useQueryItems } from '@/features/dynamodb/hooks/useQueryItems';
import { useScanItems } from '@/features/dynamodb/hooks/useScanItems';
import { useTables } from '@/features/dynamodb/hooks/useTables';

vi.mock('@/features/settings/hooks/useSettings', () => ({
  useSettings: () => ({
    endpoint: 'http://localhost:4566',
    settings: { host: 'localhost', port: 4566, region: 'us-east-1', useHttps: false },
  }),
}));

vi.mock('@/features/dynamodb/api/dynamodb', () => ({
  deleteItem: vi.fn(),
  deleteTable: vi.fn(),
  describeTable: vi.fn(),
  listTablesWithDetails: vi.fn(),
  queryItems: vi.fn(),
  scanItems: vi.fn(),
}));

function createWrapper(
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  }),
) {
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe('DynamoDB hooks', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queryItems).mockResolvedValue({ items: [] });
    vi.mocked(scanItems).mockResolvedValue({ items: [] });
    vi.mocked(deleteItem).mockResolvedValue();
    vi.mocked(deleteTable).mockResolvedValue();
  });

  it('loads subsequent table pages and keeps previous results', async () => {
    vi.mocked(listTablesWithDetails)
      .mockResolvedValueOnce({
        tables: [{ tableName: 'first', tableStatus: 'ACTIVE' }],
        lastEvaluatedTableName: 'first',
      })
      .mockResolvedValueOnce({ tables: [{ tableName: 'second', tableStatus: 'ACTIVE' }] });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useTables(), { wrapper });

    await waitFor(() => expect(result.current.tables).toHaveLength(1));
    await waitFor(() => expect(result.current.hasMore).toBe(true));
    await act(async () => {
      await result.current.loadMore();
    });
    await waitFor(() => expect(listTablesWithDetails).toHaveBeenCalledTimes(2));

    expect(result.current.tables.map((table) => table.tableName)).toEqual(['first', 'second']);
    expect(listTablesWithDetails).toHaveBeenNthCalledWith(
      2,
      { endpoint: 'http://localhost:4566', region: 'us-east-1' },
      'first',
    );
    expect(result.current.hasMore).toBe(false);
  });

  it('keeps Query disabled until the key is supplied and only runs Scan when explicitly enabled', async () => {
    const { wrapper } = createWrapper();
    renderHook(() => useQueryItems('sample-table', undefined, undefined), { wrapper });
    renderHook(() => useScanItems('sample-table'), { wrapper });

    expect(queryItems).not.toHaveBeenCalled();
    expect(scanItems).not.toHaveBeenCalled();

    const enabledQuery = renderHook(
      () => useQueryItems('sample-table', 'customer#sample', undefined),
      { wrapper },
    );
    const enabledScan = renderHook(() => useScanItems('sample-table', undefined, true), {
      wrapper,
    });

    await waitFor(() => {
      expect(queryItems).toHaveBeenCalledTimes(1);
      expect(scanItems).toHaveBeenCalledTimes(1);
    });
    expect(enabledQuery.result.current.error).toBeNull();
    expect(enabledScan.result.current.error).toBeNull();
  });

  it('invalidates table and item queries after successful deletes', async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const itemHook = renderHook(() => useDeleteItem(), { wrapper });
    const tableHook = renderHook(() => useDeleteTable(), { wrapper });

    await act(async () => {
      await itemHook.result.current.deleteItem({
        tableName: 'sample-table',
        key: { customerId: 'customer#sample', createdAt: 1 },
      });
      await tableHook.result.current.deleteTable({ tableName: 'sample-table' });
    });

    expect(deleteItem).toHaveBeenCalledOnce();
    expect(deleteTable).toHaveBeenCalledOnce();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['dynamodb', 'query-items'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['dynamodb', 'scan-items'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['dynamodb', 'tables'] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['dynamodb', 'table', 'sample-table'],
    });
  });

  it('exposes pending and error states for destructive mutations', async () => {
    let finishDelete: (() => void) | undefined;
    vi.mocked(deleteItem).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishDelete = resolve;
        }),
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteItem(), { wrapper });
    let deletePromise: Promise<void>;

    act(() => {
      deletePromise = result.current.deleteItem({
        tableName: 'sample-table',
        key: { customerId: 'customer#sample', createdAt: 1 },
      });
    });
    await waitFor(() => expect(result.current.pending).toBe(true));
    await act(async () => {
      finishDelete?.();
      await deletePromise;
    });
    await waitFor(() => expect(result.current.pending).toBe(false));

    vi.mocked(deleteItem).mockRejectedValueOnce(new Error('Delete failed'));
    await act(async () => {
      await expect(
        result.current.deleteItem({
          tableName: 'sample-table',
          key: { customerId: 'customer#sample', createdAt: 1 },
        }),
      ).rejects.toThrow('Delete failed');
    });
    await waitFor(() => expect(result.current.error).toMatchObject({ message: 'Delete failed' }));
  });

  it('exposes table deletion failures without reporting success', async () => {
    vi.mocked(deleteTable).mockRejectedValueOnce(new Error('Table delete failed'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteTable(), { wrapper });

    await act(async () => {
      await expect(result.current.deleteTable({ tableName: 'sample-table' })).rejects.toThrow(
        'Table delete failed',
      );
    });

    await waitFor(() =>
      expect(result.current.error).toMatchObject({ message: 'Table delete failed' }),
    );
  });
});
