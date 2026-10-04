// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const hooks = vi.hoisted(() => ({
  useQueues: vi.fn(),
  usePurgeQueue: vi.fn(),
  useInvalidateQueues: vi.fn(),
  useTables: vi.fn(),
  useInvalidateTables: vi.fn(),
  useTableDetails: vi.fn(),
  useQueryItems: vi.fn(),
  useScanItems: vi.fn(),
  useDeleteItem: vi.fn(),
  useDeleteTable: vi.fn(),
}));

vi.mock('@/features/sqs/hooks', () => ({
  useQueues: hooks.useQueues,
  usePurgeQueue: hooks.usePurgeQueue,
  useInvalidateQueues: hooks.useInvalidateQueues,
}));

vi.mock('@/features/sqs/components/MessageViewer', () => ({
  MessageViewer: () => null,
}));

vi.mock('@/features/sqs/components/PurgeConfirmDialog', () => ({
  PurgeConfirmDialog: () => null,
}));

vi.mock('@/features/dynamodb/hooks', () => ({
  useTables: hooks.useTables,
  useInvalidateTables: hooks.useInvalidateTables,
  useTableDetails: hooks.useTableDetails,
  useQueryItems: hooks.useQueryItems,
  useScanItems: hooks.useScanItems,
  useDeleteItem: hooks.useDeleteItem,
  useDeleteTable: hooks.useDeleteTable,
}));

import QueuesPage from './QueuesPage';
import DynamoDbPage from './DynamoDbPage';

describe('resource page titles', () => {
  afterEach(cleanup);

  it('uses Queues as the SQS page title in normal and error states', () => {
    hooks.useQueues.mockReturnValue({
      queues: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    hooks.usePurgeQueue.mockReturnValue({ purge: vi.fn(), pending: false });
    hooks.useInvalidateQueues.mockReturnValue(vi.fn());

    render(<QueuesPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Queues' })).toBeTruthy();
    expect(screen.getByText('SQS')).toBeTruthy();

    cleanup();
    hooks.useQueues.mockReturnValue({
      queues: [],
      loading: false,
      error: new Error('SQS unavailable'),
      refetch: vi.fn(),
    });
    render(<QueuesPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'Queues' })).toBeTruthy();
  });

  it('uses Tables as the DynamoDB table-list title in normal and error states', () => {
    hooks.useTables.mockReturnValue({
      tables: [],
      lastEvaluatedTableName: undefined,
      hasMore: false,
      loadingMore: false,
      loadMore: vi.fn(),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    hooks.useInvalidateTables.mockReturnValue(vi.fn());
    hooks.useTableDetails.mockReturnValue({
      tableDetails: undefined,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    hooks.useQueryItems.mockReturnValue({
      items: [],
      lastEvaluatedKey: undefined,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    hooks.useScanItems.mockReturnValue({
      items: [],
      lastEvaluatedKey: undefined,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    hooks.useDeleteItem.mockReturnValue({ deleteItem: vi.fn(), pending: false });
    hooks.useDeleteTable.mockReturnValue({ deleteTable: vi.fn(), pending: false });

    render(<DynamoDbPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Tables' })).toBeTruthy();
    expect(screen.getByText('DynamoDB')).toBeTruthy();

    cleanup();
    hooks.useTables.mockReturnValue({
      tables: [],
      lastEvaluatedTableName: undefined,
      hasMore: false,
      loadingMore: false,
      loadMore: vi.fn(),
      loading: false,
      error: new Error('DynamoDB unavailable'),
      refetch: vi.fn(),
    });
    render(<DynamoDbPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'Tables' })).toBeTruthy();
  });

  it('loads Scan only in the Items view and stops item queries when returning to table View', () => {
    hooks.useTables.mockReturnValue({
      tables: [{ tableName: 'sample-table', tableStatus: 'ACTIVE' }],
      lastEvaluatedTableName: undefined,
      hasMore: false,
      loadingMore: false,
      loadMore: vi.fn(),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    hooks.useInvalidateTables.mockReturnValue(vi.fn());
    hooks.useTableDetails.mockReturnValue({
      tableDetails: undefined,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    hooks.useQueryItems.mockReturnValue({
      items: [],
      lastEvaluatedKey: undefined,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    hooks.useScanItems.mockReturnValue({
      items: [],
      lastEvaluatedKey: undefined,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    hooks.useDeleteItem.mockReturnValue({ deleteItem: vi.fn(), pending: false });
    hooks.useDeleteTable.mockReturnValue({ deleteTable: vi.fn(), pending: false });

    render(<DynamoDbPage />);
    expect(hooks.useScanItems).toHaveBeenLastCalledWith(null, undefined, false);

    fireEvent.click(screen.getByRole('button', { name: 'View items in sample-table' }));
    expect(hooks.useScanItems).toHaveBeenLastCalledWith('sample-table', undefined, true);

    fireEvent.click(screen.getByRole('button', { name: 'View table' }));
    expect(hooks.useScanItems).toHaveBeenLastCalledWith('sample-table', undefined, false);
  });
});