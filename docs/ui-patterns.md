# UI Patterns & Conventions

This document captures the established UI patterns and conventions for resource pages in this dashboard. Follow these patterns when implementing new AWS resource features.

## Page Structure

### Resource Page Header

Every resource page uses a consistent header structure:

```tsx
<div className="flex items-center justify-between">
  <div>
    <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
      {AWS_SERVICE_NAME}  {/* e.g., "SQS", "S3", "DynamoDB", "Lambda" */}
    </p>
    <h2 className="mt-3 text-2xl font-semibold text-white">
      {RESOURCE_COLLECTION_NAME}  {/* e.g., "Queues", "Buckets", "Tables", "Functions" */}
    </h2>
  </div>
  <RefreshButton onClick={handleRefresh} loading={loading} />
</div>
```

**Rules:**
- Category label (uppercase, small): AWS service name (SQS, S3, DynamoDB, Lambda)
- Main title (large): Plural resource collection name (Queues, Buckets, Tables, Functions)
- Right side: Refresh button (and other page-level actions)

### Error State Header

Same structure, but with error styling:

```tsx
<div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6">
  <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-400">
    {AWS_SERVICE_NAME}
  </p>
  <h2 className="mt-3 text-2xl font-semibold text-white">
    {RESOURCE_COLLECTION_NAME}
  </h2>
  {/* Error message and Retry button */}
</div>
```

## Action Button Conventions

Resource list tables use consistent action buttons. Order: **View → [Items/Open] → Delete**

| Button | Label | Purpose | Variant |
|--------|-------|---------|---------|
| **View** | `View` | Show resource metadata/configuration (creation date, keys, encryption, versioning, etc.) | `secondary` / outline |
| **Items** | `Items` | Navigate to the records/items inside the resource (DynamoDB tables → items) | `secondary` cyan |
| **Open** | `Open` | Browse contents of container-like resources (S3 buckets → objects) | `secondary` |
| **Delete** | `Delete` | Permanently remove the resource | `destructive` |

### Per-Resource Mapping

| Resource | View | Items/Open | Delete |
|----------|------|------------|--------|
| **SQS Queues** | N/A (no metadata) | `View Messages` → modal | `Purge` (clear messages) |
| **S3 Buckets** | `View` (config: region, versioning, encryption, public access) | `Open` (browse objects) | `Delete` (bucket must be empty) |
| **DynamoDB Tables** | `Details` (keys, indexes, capacity, metadata) | `Items` (Query/Scan tabs) | `Delete` (removes all items) |
| **Lambda Functions** | `View` (config, code, environment) | `Invoke` (test execution) | N/A (not implemented) |

### Button Implementation

```tsx
// View - metadata/configuration
<Button variant="secondary" size="sm" onClick={() => onViewResource(name)}>
  View
</Button>

// Items - records inside (DynamoDB)
<Button variant="secondary" size="sm" onClick={() => onViewItems(name)} className="border-cyan-500/30 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
  Items
</Button>

// Open - browse contents (S3)
<Button variant="secondary" size="sm" onClick={() => onOpenResource(name)}>
  Open
</Button>

// Delete - destructive
<Button variant="destructive" size="sm" onClick={() => onDeleteResource(name)}>
  Delete
</Button>
```

## Navigation Sidebar

Sidebar entries use AWS service names, not collection names:

| Service | Sidebar Label | Route |
|---------|---------------|-------|
| SQS | `SQS` | `/queues` |
| Lambda | `Lambda` | `/lambda` |
| DynamoDB | `DynamoDB` | `/dynamodb` |
| S3 | `S3` | `/s3` |

## Resource Detail Views

When "View" is clicked, show a dedicated detail screen with:

1. **Back button** - Returns to list
2. **Header** - Resource name + service label
3. **Metadata sections** - Organized by category (Basic info, Keys/Schema, Configuration, Access control)
4. **Loading/Error/Empty states** - Consistent with list views

Example structure (S3 BucketDetails, DynamoDB TableDetails):
```tsx
<section className="space-y-4">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
        {DETAIL_CATEGORY}  {/* "Bucket configuration", "Table Details" */}
      </p>
      <h3 className="mt-1 font-mono text-xl font-semibold text-white">{resourceName}</h3>
    </div>
    <Button variant="outline" onClick={onBack}>Back to {collectionName}</Button>
  </div>
  
  <Card className="space-y-5 p-6">
    {/* Grid of metadata fields */}
    <Separator />
    {/* Additional sections */}
  </Card>
</section>
```

## Items/Contents Views

When "Items" or "Open" is clicked:

1. **Back button** - Returns to list
2. **Tabs/Controls** - Query/Scan for DynamoDB, pagination for S3
3. **Data display** - Table or structured list
4. **Item-level actions** - Delete item, view details
5. **Pagination** - Previous/Next with continuation tokens

## Visual Design Tokens

- **Category label**: `text-sm font-medium uppercase tracking-[0.2em] text-cyan-400`
- **Page title**: `mt-3 text-2xl font-semibold text-white`
- **Error category**: `text-red-400`
- **Error title**: `text-white` on `bg-red-500/10 border-red-500/50`
- **Card background**: `bg-slate-900/50` with `border-slate-800`
- **Action button gap**: `gap-2`
- **Section spacing**: `space-y-4` / `space-y-6`

## Adding New Resource Features

When adding a new AWS resource:

1. Add sidebar entry with service name (e.g., `EventBridge`)
2. Create page with service name as category label, plural collection as title
3. Implement list with standard action buttons (View, Items/Open, Delete)
4. Create detail view for "View" (metadata, configuration)
5. Create items view for "Items/Open" (records with query/scan or pagination)
6. Follow existing patterns in `src/features/{service}/components/`
7. Reuse project UI primitives from `src/components/ui/`