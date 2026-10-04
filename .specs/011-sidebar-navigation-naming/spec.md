# Technical Specification: Sidebar Navigation Naming

## Architecture

### Files to Modify

1. `src/config/navigation.ts` - Update sidebar label from "Queues" to "SQS"
2. `src/pages/QueuesPage.tsx` - Keep "Queues" as the page title and "SQS" as its category label

### Navigation Configuration

```typescript
// src/config/navigation.ts
export const navigation: NavigationItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/queues', label: 'SQS', icon: MessageSquare }, // Changed from 'Queues'
  { path: '/lambda', label: 'Lambda', icon: FunctionSquare },
  { path: '/dynamodb', label: 'DynamoDB', icon: Database },
  { path: '/s3', label: 'S3', icon: HardDrive },
  // ... rest unchanged
];
```

### Page Title Update

```tsx
// src/pages/QueuesPage.tsx
<div className="flex items-center justify-between">
  <div>
    <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">SQS</p>
    <h2 className="mt-3 text-2xl font-semibold text-white">Queues</h2>
  </div>
  <RefreshButton onClick={handleRefresh} loading={loading} />
</div>
```

## Data Structures

No changes to data structures required. The `SQSQueue` type and `useQueues` hook remain unchanged.

## API Integration

No API changes required. This is a UI/labeling change only.

## Security

No security implications. This is a client-side label change only.

## Testing

- Verify sidebar shows "SQS" for the queues navigation item
- Verify page header shows "Queues" and the category label shows "SQS"
- Verify queue list still displays correctly
- Verify routing to `/queues` still works
