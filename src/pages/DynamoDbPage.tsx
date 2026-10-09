'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import {
  useTables,
  useInvalidateTables,
  useTableDetails,
  useQueryItems,
  useScanItems,
  useDeleteItem,
  useDeleteTable,
} from '@/features/dynamodb/hooks';
import {
  TableList,
  TableDetails,
  ItemQueryForm,
  ScanForm,
  ItemResults,
  ItemPagination,
  DeleteConfirmDialog,
  RefreshButton,
} from '@/features/dynamodb/components';
import type {
  DynamoKey,
  DynamoItem,
  SortKeyCondition,
  DynamoKeyValue,
} from '@/features/dynamodb/types';
import { toast } from '@/hooks/use-toast';

export default function DynamoDbPage() {
  const {
    tables,
    lastEvaluatedTableName,
    hasMore: hasMoreTables,
    loadingMore: loadingMoreTables,
    loadMore: loadMoreTables,
    loading: tablesLoading,
    error: tablesError,
    refetch: refetchTables,
  } = useTables();
  const invalidateTables = useInvalidateTables();

  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);
  const [selectedTableView, setSelectedTableView] = useState<'view' | 'items' | null>(null);
  const [searchMode, setSearchMode] = useState<'query' | 'scan'>('query');
  const [queryPageKeys, setQueryPageKeys] = useState<Array<DynamoKey | undefined>>([undefined]);
  const [queryPageIndex, setQueryPageIndex] = useState(0);
  const [scanPageKeys, setScanPageKeys] = useState<Array<DynamoKey | undefined>>([undefined]);
  const [scanPageIndex, setScanPageIndex] = useState(0);
  const [scanStarted, setScanStarted] = useState(false);
  const [queryParams, setQueryParams] = useState<{
    partitionKeyValue: DynamoKeyValue | undefined;
    sortKeyCondition: SortKeyCondition | undefined;
  }>({
    partitionKeyValue: undefined,
    sortKeyCondition: undefined,
  });

  const {
    tableDetails,
    loading: detailsLoading,
    error: detailsError,
    refetch: refetchDetails,
  } = useTableDetails(selectedTableName);

  const partitionKey = tableDetails?.keySchema.find((k) => k.keyType === 'HASH');
  const sortKey = tableDetails?.keySchema.find((k) => k.keyType === 'RANGE');

  const {
    items,
    lastEvaluatedKey,
    loading: queryLoading,
    error: queryError,
    refetch: refetchQuery,
  } = useQueryItems(
    selectedTableName,
    selectedTableView === 'items' && searchMode === 'query'
      ? queryParams.partitionKeyValue
      : undefined,
    selectedTableView === 'items' && searchMode === 'query'
      ? queryParams.sortKeyCondition
      : undefined,
    queryPageKeys[queryPageIndex],
  );

  const {
    items: scanItems,
    lastEvaluatedKey: scanLastEvaluatedKey,
    loading: scanLoading,
    error: scanError,
    refetch: refetchScan,
  } = useScanItems(
    selectedTableName,
    scanPageKeys[scanPageIndex],
    selectedTableView === 'items' && searchMode === 'scan' && scanStarted,
  );

  const { deleteItem, pending: deleteItemPending } = useDeleteItem();
  const { deleteTable, pending: deleteTablePending } = useDeleteTable();

  const [deleteItemDialog, setDeleteItemDialog] = useState<{
    open: boolean;
    item: DynamoItem | null;
    key: DynamoKey | null;
  }>({
    open: false,
    item: null,
    key: null,
  });
  const [deleteTableDialog, setDeleteTableDialog] = useState<{
    open: boolean;
    tableName: string | null;
  }>({
    open: false,
    tableName: null,
  });

  const currentItems = searchMode === 'query' ? items : scanItems;
  const currentLastEvaluatedKey = searchMode === 'query' ? lastEvaluatedKey : scanLastEvaluatedKey;
  const currentLoading = searchMode === 'query' ? queryLoading : scanLoading;
  const currentError = searchMode === 'query' ? queryError : scanError;
  const currentRefetch = searchMode === 'query' ? refetchQuery : refetchScan;

  const handleViewTable = (tableName: string) => {
    setSelectedTableName(tableName);
    setSelectedTableView('view');
    setSearchMode('query');
    setQueryPageKeys([undefined]);
    setQueryPageIndex(0);
    setScanPageKeys([undefined]);
    setScanPageIndex(0);
    setScanStarted(false);
    setQueryParams({ partitionKeyValue: undefined, sortKeyCondition: undefined });
  };

  const handleViewItems = (tableName: string) => {
    setSelectedTableName(tableName);
    setSelectedTableView('items');
    setSearchMode('scan');
    setScanPageKeys([undefined]);
    setScanPageIndex(0);
    setQueryPageKeys([undefined]);
    setQueryPageIndex(0);
    setScanStarted(true);
    setQueryParams({ partitionKeyValue: undefined, sortKeyCondition: undefined });
  };

  const handleDeleteTableClick = (tableName: string) => {
    setDeleteTableDialog({ open: true, tableName });
  };

  const handleDeleteTableConfirm = async () => {
    if (!deleteTableDialog.tableName) return;

    try {
      await deleteTable({ tableName: deleteTableDialog.tableName });
      toast({
        title: 'Table deleted',
        description: `Table ${deleteTableDialog.tableName} has been deleted`,
        variant: 'success',
      });
      invalidateTables();
      setSelectedTableName(null);
      setSelectedTableView(null);
      setDeleteTableDialog({ open: false, tableName: null });
    } catch (err) {
      toast({
        title: 'Failed to delete table',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleQuerySubmit = (
    partitionKeyValue: DynamoKeyValue,
    sortKeyCondition?: SortKeyCondition,
  ) => {
    setQueryParams({ partitionKeyValue, sortKeyCondition: sortKeyCondition ?? undefined });
    setSearchMode('query');
    setQueryPageKeys([undefined]);
    setQueryPageIndex(0);
  };

  const handleScanClick = () => {
    setSearchMode('scan');
    setScanPageKeys([undefined]);
    setScanPageIndex(0);
    setScanStarted(true);
    setQueryParams({ partitionKeyValue: undefined, sortKeyCondition: undefined });
  };

  const handleNextPage = () => {
    if (!currentLastEvaluatedKey) return;

    if (searchMode === 'query') {
      setQueryPageKeys((keys) => [
        ...keys.slice(0, queryPageIndex + 1),
        currentLastEvaluatedKey,
      ]);
      setQueryPageIndex((index) => index + 1);
    } else {
      setScanPageKeys((keys) => [
        ...keys.slice(0, scanPageIndex + 1),
        currentLastEvaluatedKey,
      ]);
      setScanPageIndex((index) => index + 1);
    }
  };

  const handlePreviousPage = () => {
    if (searchMode === 'query') {
      setQueryPageIndex((index) => Math.max(0, index - 1));
    } else {
      setScanPageIndex((index) => Math.max(0, index - 1));
    }
  };

  const handleDeleteItemClick = (item: DynamoItem, key: DynamoKey) => {
    setDeleteItemDialog({ open: true, item, key });
  };

  const handleDeleteItemConfirm = async () => {
    if (!deleteItemDialog.item || !deleteItemDialog.key || !selectedTableName) return;

    try {
      await deleteItem({ tableName: selectedTableName, key: deleteItemDialog.key });
      toast({
        title: 'Item deleted',
        description: 'Item has been deleted from the table',
        variant: 'success',
      });
      currentRefetch();
      setDeleteItemDialog({ open: false, item: null, key: null });
    } catch (err) {
      toast({
        title: 'Failed to delete item',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    refetchTables();
    toast({
      title: 'Refreshing',
      description: 'Fetching latest table data...',
    });
  };

  if (tablesError) {
    return (
      <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-400">DynamoDB</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Tables</h2>
        <div className="mt-4 text-red-300">
          <p>Failed to connect to DynamoDB endpoint</p>
          <p className="mt-1 text-sm text-slate-400">
            {tablesError instanceof Error ? tablesError.message : 'Unknown error'}
          </p>
          <Button variant="outline" onClick={handleRefresh} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">DynamoDB</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Tables</h2>
        </div>
        <RefreshButton onClick={handleRefresh} loading={tablesLoading} />
      </div>

      {selectedTableName ? (
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTableName(null);
              setSelectedTableView(null);
            }}
            className="text-slate-400 hover:text-white"
          >
            ← Back to Tables
          </Button>

          {detailsError ? (
            <Alert className="border-red-500/50 bg-red-500/10 text-red-300" role="alert">
              <AlertDescription>
                <p>Failed to load table details: {detailsError.message}</p>
                <Button variant="outline" onClick={() => refetchDetails()} className="mt-3">
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : selectedTableView === 'view' ? (
            <TableDetails tableDetails={tableDetails} loading={detailsLoading} />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
                    Items
                  </p>
                  <h3 className="mt-1 break-all font-mono text-lg font-semibold text-white">
                    {selectedTableName}
                  </h3>
                </div>
                <Button variant="outline" onClick={() => setSelectedTableView('view')}>
                  View table
                </Button>
              </div>

              <Tabs
                value={searchMode}
                onValueChange={(value) => setSearchMode(value as 'query' | 'scan')}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="query">Query by Key</TabsTrigger>
                  <TabsTrigger value="scan">Scan Table</TabsTrigger>
                </TabsList>

                <TabsContent value="query" className="mt-4 space-y-4">
                  {tableDetails ? (
                    <ItemQueryForm
                      partitionKey={partitionKey}
                      sortKey={sortKey}
                      onQuery={handleQuerySubmit}
                      loading={queryLoading}
                    />
                  ) : (
                    <Alert className="border-slate-700 bg-slate-800/50 text-slate-400">
                      <AlertDescription>Loading table key schema...</AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="scan" className="mt-4 space-y-4">
                  <ScanForm
                    onScan={handleScanClick}
                    loading={scanLoading}
                    hasMore={!!scanLastEvaluatedKey}
                    itemCount={scanItems.length}
                  />
                </TabsContent>
              </Tabs>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Records ({currentItems.length})
                </h3>

                <ItemResults
                  items={currentItems}
                  loading={currentLoading}
                  error={currentError}
                  onRetry={currentRefetch}
                  onDeleteItem={handleDeleteItemClick}
                  getItemKey={(item) => {
                    const details = tableDetails;
                    if (!details) return {};
                    const key: DynamoKey = {};
                    const pk = details.keySchema.find((k) => k.keyType === 'HASH');
                    const sk = details.keySchema.find((k) => k.keyType === 'RANGE');
                    if (pk && item[pk.attributeName] !== undefined) {
                      key[pk.attributeName] = item[pk.attributeName] as
                        | string
                        | number
                        | Uint8Array;
                    }
                    if (sk && item[sk.attributeName] !== undefined) {
                      key[sk.attributeName] = item[sk.attributeName] as
                        | string
                        | number
                        | Uint8Array;
                    }
                    return key;
                  }}
                  emptyMessage={
                    searchMode === 'query' ? 'No items match the query' : 'No items found in scan'
                  }
                />

                <ItemPagination
                  pageNumber={(searchMode === 'query' ? queryPageIndex : scanPageIndex) + 1}
                  hasPreviousPage={(searchMode === 'query' ? queryPageIndex : scanPageIndex) > 0}
                  hasNextPage={Boolean(currentLastEvaluatedKey)}
                  loading={currentLoading}
                  onPreviousPage={handlePreviousPage}
                  onNextPage={handleNextPage}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <TableList
          tables={tables}
          loading={tablesLoading}
          onViewTable={handleViewTable}
          onViewItems={handleViewItems}
          onDeleteTable={handleDeleteTableClick}
          lastEvaluatedTableName={lastEvaluatedTableName}
          onLoadMore={loadMoreTables}
          hasMore={hasMoreTables}
          loadingMore={loadingMoreTables}
        />
      )}

      <DeleteConfirmDialog
        open={deleteItemDialog.open}
        onOpenChange={(open) => setDeleteItemDialog({ ...deleteItemDialog, open })}
        onConfirm={handleDeleteItemConfirm}
        pending={deleteItemPending}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        itemKey={deleteItemDialog.key ?? undefined}
        tableName={selectedTableName ?? undefined}
      />

      <DeleteConfirmDialog
        open={deleteTableDialog.open}
        onOpenChange={(open) => setDeleteTableDialog({ ...deleteTableDialog, open })}
        onConfirm={handleDeleteTableConfirm}
        pending={deleteTablePending}
        title="Delete Table"
        description="Are you sure you want to delete this table? This will permanently delete all items in the table."
        tableName={deleteTableDialog.tableName ?? undefined}
      />
    </div>
  );
}
