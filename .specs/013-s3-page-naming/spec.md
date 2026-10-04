# Technical Specification: S3 Page Naming

## Architecture

### Files to Modify
1. `src/pages/S3Page.tsx` - Update page header labels
2. `src/features/s3/components/BucketList.tsx` - Add "View" action button

### Page Header Changes
```tsx
// src/pages/S3Page.tsx - Main header (lines 113-116)
<div className="flex flex-wrap items-center justify-between gap-3">
  <div>
    <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">S3</p>  // Was "Storage"
    <h2 className="mt-3 text-2xl font-semibold text-white">aws local S3</h2>  // Was "S3 Buckets"
  </div>
  <Button variant="outline" onClick={refresh} disabled={activeFetching}>
    {activeFetching ? 'Refreshing...' : 'Refresh'}
  </Button>
</div>
```

### Bucket List Action Buttons
```tsx
// src/features/s3/components/BucketList.tsx - Update props interface (lines 14-19)
interface BucketListProps {
  buckets: S3Bucket[];
  loading: boolean;
  onSelectBucket: (name: string) => void;      // Open action (browse contents)
  onViewBucket: (name: string) => void;        // New: View action (metadata)
  onDeleteBucket: (name: string) => void;
}

// src/features/s3/components/BucketList.tsx - Update action buttons (lines 57-75)
<TableCell>
  <div className="flex justify-end gap-2">
    <Button
      variant="secondary"
      size="sm"
      onClick={() => onViewBucket(bucket.name)}
    >
      View
    </Button>
    <Button
      variant="secondary"
      size="sm"
      onClick={() => onSelectBucket(bucket.name)}
    >
      Open
    </Button>
    <Button
      variant="destructive"
      size="sm"
      onClick={() => onDeleteBucket(bucket.name)}
      aria-label={`Delete bucket ${bucket.name}`}
    >
      Delete
    </Button>
  </div>
</TableCell>
```

### S3Page Integration
```tsx
// src/pages/S3Page.tsx - Add handler for View action
const viewBucket = (bucketName: string) => {
  // Navigate to bucket details view - could be a new state or modal
  // For now, could open a details dialog or navigate to a detail view
  // Implementation depends on UX decision
};

// src/pages/S3Page.tsx - Update BucketList usage (lines 165-170)
<BucketList
  buckets={buckets}
  loading={bucketsLoading}
  onSelectBucket={openBucket}        // Open - browse contents
  onViewBucket={viewBucket}          // View - bucket metadata
  onDeleteBucket={(name) => setDeleteTarget({ kind: 'bucket', name })}
/>
```

### New Bucket Details View (Future Enhancement)
A "View" action should show bucket metadata:
- Creation date
- Region/Location constraint
- Versioning status
- Server-side encryption
- Bucket policy status
- Public access block settings
- Tags
- Lifecycle rules

## Data Structures
No changes to data structures. Uses existing `S3Bucket` type from `@/features/s3/types/s3`.

## API Integration
No API changes. Uses existing hooks: `useBuckets`, `useBucketObjects`, `useDeleteBucket`, `useDeleteObject`.

## Security
No security implications. Client-side label and UI changes only.

## Testing
- Verify page header shows "S3" / "aws local S3"
- Verify bucket list shows "View", "Open", "Delete" buttons
- Click "View" → shows bucket metadata (creation date, versioning, encryption, etc.)
- Click "Open" → shows BucketContents with object listing
- Click "Delete" → shows confirmation dialog
- Verify routing and state management works correctly