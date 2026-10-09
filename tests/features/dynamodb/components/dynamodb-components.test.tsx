// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DeleteConfirmDialog } from '@/features/dynamodb/components/DeleteConfirmDialog';
import { ItemQueryForm } from '@/features/dynamodb/components/ItemQueryForm';
import { ItemResults } from '@/features/dynamodb/components/ItemResults';
import { ScanForm } from '@/features/dynamodb/components/ScanForm';
import { TableList } from '@/features/dynamodb/components/TableList';
import { TableDetails } from '@/features/dynamodb/components/TableDetails';
import { ItemPagination } from '@/features/dynamodb/components/ItemPagination';

describe('DynamoDB components', () => {
  afterEach(cleanup);

  it('selects a table and offers the next table page', () => {
    const onViewTable = vi.fn();
    const onViewItems = vi.fn();
    const onLoadMore = vi.fn();

    render(
      <TableList
        tables={[{ tableName: 'sample-table', tableStatus: 'ACTIVE', itemCount: 3 }]}
        loading={false}
        onViewTable={onViewTable}
        onViewItems={onViewItems}
        onDeleteTable={vi.fn()}
        onLoadMore={onLoadMore}
        hasMore
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'View details for sample-table' }));
    fireEvent.click(screen.getByRole('button', { name: 'View items in sample-table' }));
    fireEvent.click(screen.getByRole('button', { name: 'Load More Tables' }));

    expect(onViewTable).toHaveBeenCalledWith('sample-table');
    expect(onViewItems).toHaveBeenCalledWith('sample-table');
    expect(onLoadMore).toHaveBeenCalledOnce();
  });

  it('submits a validated partition key and rejects an empty value', () => {
    const onQuery = vi.fn();
    render(
      <ItemQueryForm
        partitionKey={{ attributeName: 'customerId', attributeType: 'S', keyType: 'HASH' }}
        sortKey={undefined}
        onQuery={onQuery}
        loading={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Query Items' }));
    expect(screen.getByText('Partition key value is required')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Partition Key:/), {
      target: { value: 'customer#sample' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Query Items' }));

    expect(onQuery).toHaveBeenCalledWith('customer#sample', undefined);
  });

  it('rejects invalid numeric partition key values', () => {
    const onQuery = vi.fn();
    render(
      <ItemQueryForm
        partitionKey={{ attributeName: 'customerId', attributeType: 'N', keyType: 'HASH' }}
        sortKey={undefined}
        onQuery={onQuery}
        loading={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Partition Key:/), {
      target: { value: 'not-a-number' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Query Items' }));

    expect(screen.getByText('Partition key must be a valid number')).toBeTruthy();
    expect(onQuery).not.toHaveBeenCalled();
  });

  it('starts a Scan only after explicit user action', () => {
    const onScan = vi.fn();
    render(<ScanForm onScan={onScan} loading={false} hasMore={false} itemCount={0} />);

    expect(onScan).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Scan Table' }));
    expect(onScan).toHaveBeenCalledOnce();
  });

  it('warns that table deletion removes all items and requires confirmation', () => {
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        pending={false}
        title="Delete Table"
        description="Deleting this table permanently deletes all items in it."
        tableName="sample-table"
      />,
    );

    expect(screen.getByText(/permanently deletes all items/i)).toBeTruthy();
    expect(screen.getAllByText('sample-table')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('offers retry when item loading fails', () => {
    const onRetry = vi.fn();
    render(
      <ItemResults
        items={[]}
        loading={false}
        error={new Error('Request failed')}
        onDeleteItem={vi.fn()}
        getItemKey={() => ({})}
        onRetry={onRetry}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows table creation metadata and global/local secondary indexes', () => {
    render(
      <TableDetails
        loading={false}
        tableDetails={{
          tableName: 'sample-table',
          tableStatus: 'ACTIVE',
          creationDateTime: new Date('2024-01-01T00:00:00.000Z'),
          itemCount: 3,
          tableSizeBytes: 128,
          keySchema: [
            { attributeName: 'pk', attributeType: 'S', keyType: 'HASH' },
            { attributeName: 'sk', attributeType: 'N', keyType: 'RANGE' },
          ],
          secondaryIndexes: [
            {
              indexName: 'email-index',
              indexType: 'GLOBAL',
              indexStatus: 'ACTIVE',
              keySchema: [{ attributeName: 'email', attributeType: 'S', keyType: 'HASH' }],
            },
            {
              indexName: 'created-index',
              indexType: 'LOCAL',
              keySchema: [{ attributeName: 'createdAt', attributeType: 'N', keyType: 'RANGE' }],
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Created')).toBeTruthy();
    expect(screen.getByText('email-index')).toBeTruthy();
    expect(screen.getByText('Global secondary index')).toBeTruthy();
    expect(screen.getByText('Local secondary index')).toBeTruthy();
    expect(screen.getByText('Status: ACTIVE')).toBeTruthy();
  });

  it('renders full long nested item values without truncating them', () => {
    const longValue = { description: 'complete-value-'.repeat(30), nested: { active: true } };
    render(
      <ItemResults
        items={[{ pk: 'sample', metadata: longValue }]}
        loading={false}
        error={null}
        onDeleteItem={vi.fn()}
        getItemKey={() => ({ pk: 'sample' })}
      />,
    );

    expect(screen.getByText(new RegExp(longValue.description))).toBeTruthy();
    expect(screen.getByText(/"active": true/)).toBeTruthy();
    expect(screen.getByRole('table').parentElement?.className).not.toContain('max-h-96');
  });

  it('provides previous and next controls with a current page indicator', () => {
    const onPreviousPage = vi.fn();
    const onNextPage = vi.fn();
    render(
      <ItemPagination
        pageNumber={2}
        hasPreviousPage
        hasNextPage
        loading={false}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Page 2')).toBeTruthy();
    expect(onPreviousPage).toHaveBeenCalledOnce();
    expect(onNextPage).toHaveBeenCalledOnce();
  });
});
