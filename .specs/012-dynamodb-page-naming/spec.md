# Technical Specification: DynamoDB Page Naming

## Architecture

### Files to Modify

1. `src/pages/DynamoDbPage.tsx` - Update page header labels
2. `src/features/dynamodb/components/TableList.tsx` - Update action button labels

### Page Header Changes

```tsx
// src/pages/DynamoDbPage.tsx - Error state (lines 217-219)
<div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6">
  <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-400">DynamoDB</p>  // Was "Database"
  <h2 className="mt-3 text-2xl font-semibold text-white">Tables</h2>

// src/pages/DynamoDbPage.tsx - Main header (lines 235-239)
<div className="flex items-center justify-between">
  <div>
    <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">DynamoDB</p>  // Was "Database"
    <h2 className="mt-3 text-2xl font-semibold text-white">Tables</h2>
  </div>
  <RefreshButton onClick={handleRefresh} loading={tablesLoading} />
</div>
```

### Table List Action Buttons

```tsx
// src/features/dynamodb/components/TableList.tsx (lines 126-141)
<TableCell>
  <div className="flex items-center justify-end gap-2">
    <button
      type="button"
      onClick={() => onSelectTable(table.tableName)}
      className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white transition-colors hover:bg-slate-700"
    >
      View
    </button>
    <button
      type="button"
      onClick={() => onViewItems(table.tableName)} // New handler for Items
      className="rounded border border-cyan-500/30 bg-cyan-500/20 px-3 py-1.5 text-sm text-cyan-400 transition-colors hover:bg-cyan-500/30"
    >
      Items
    </button>
    <button
      type="button"
      onClick={() => onDeleteTable(table.tableName)}
      className="rounded border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/30"
    >
      Delete
    </button>
  </div>
</TableCell>
```

### New Prop Interface for TableList

```typescript
// src/features/dynamodb/components/TableList.tsx
interface TableListProps {
  tables: DynamoTableSummary[];
  loading: boolean;
  onSelectTable: (tableName: string) => void; // Details action
  onViewItems: (tableName: string) => void; // New: Items action
  onDeleteTable: (tableName: string) => void;
  // ... rest unchanged
}
```

### DynamoDbPage Integration

```tsx
// src/pages/DynamoDbPage.tsx - Update TableList usage (line 348-357)
<TableList
  tables={tables}
  loading={tablesLoading}
  onSelectTable={handleSelectTable} // Details
  onViewItems={handleSelectTable} // Items - same navigation, different tab
  onDeleteTable={handleDeleteTableClick}
  // ... rest unchanged
/>;

// View opens metadata; Items opens the records and defaults to the explicit Scan tab
const handleViewItems = (tableName: string) => {
  setSelectedTableName(tableName);
  setSearchMode('scan'); // Default to scan for Items view
  setScanExclusiveStartKey(undefined);
  setScanStarted(true);
  setQueryParams({ partitionKeyValue: undefined, sortKeyCondition: undefined });
};
```

## Data Structures

No changes to data structures. Uses existing `DynamoTableSummary`, `DynamoTableDetails` types.

## API Integration

No API changes. Uses existing hooks: `useTables`, `useTableDetails`, `useQueryItems`, `useScanItems`, `useDeleteTable`.

## Security

No security implications. Client-side label and UI changes only.

## Testing

- Verify page header shows "DynamoDB" / "Tables"
- Verify table list shows "View", "Items", "Delete" buttons
- Click "View" → shows table creation date, key schema, and any global/local secondary indexes
- Click "Items" → shows Query/Scan tabs with table records
- Click "Delete" → shows confirmation dialog
- Verify routing and state management works correctly
