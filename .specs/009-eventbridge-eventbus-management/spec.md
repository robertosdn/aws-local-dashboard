# Technical Specification: EventBridge EventBus Management

## Architecture Overview
This feature adds EventBridge EventBus management capabilities to the existing React dashboard. It follows the established patterns for AWS service pages in the codebase.

## Data Structures

### EventBus List Item
```typescript
interface EventBusListItem {
  Name: string;
  Arn: string;
  CreatedAt: string; // ISO 8601
}
```

### EventBus Detail
```typescript
interface EventBusDetail {
  Name: string;
  Arn: string;
  Policy?: string; // JSON string
  CreatedAt: string;
  Rules: EventBridgeRule[];
}

interface EventBridgeRule {
  Name: string;
  Arn: string;
  EventPattern?: string; // JSON string
  ScheduleExpression?: string;
  State: 'ENABLED' | 'DISABLED';
  Description?: string;
  EventBusName: string;
  CreatedAt: string;
  Targets: RuleTarget[];
}

interface RuleTarget {
  Id: string;
  Arn: string;
  RoleArn?: string;
  Input?: string;
  InputPath?: string;
}
```

## API Integration

### Endpoints (via localstack/ministack on localhost:4566)
- `ListEventBuses` - GET / - Action=ListEventBuses
- `DescribeEventBus` - GET / - Action=DescribeEventBus&Name={name}
- `ListRules` - GET / - Action=ListRules&EventBusName={name}
- `ListTargetsByRule` - GET / - Action=ListTargetsByRule&Rule={name}&EventBusName={name}

### AWS SDK Client
Use `@aws-sdk/client-eventbridge` with custom endpoint configuration:
```typescript
const client = new EventBridgeClient({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
});
```

## Components

### Page Structure
```
src/pages/EventBridge/
├── EventBusListPage.tsx       # Main list view
├── EventBusDetailPage.tsx     # Detail view
└── components/
    ├── EventBusTable.tsx      # Reusable table component
    ├── EventBusPolicyDisplay.tsx
    └── RuleList.tsx
```

### Routing
- `/eventbridge/eventbuses` - List view
- `/eventbridge/eventbuses/:name` - Detail view

### Navigation Integration
Add to sidebar navigation under "EventBridge" section:
- Event Buses
- (Future) Rules
- (Future) Archives

## State Management
- Use React Query (TanStack Query) for server state
- Cache key: `['eventbridge', 'eventbuses']` for list
- Cache key: `['eventbridge', 'eventbus', name]` for detail
- Invalidate on refresh

## UI Components (Project Primitives)
Reuse existing primitives from `src/components/ui/`:
- `Table` - for event bus list
- `Card` - for detail sections
- `Badge` - for rule state (ENABLED/DISABLED)
- `CodeBlock` - for policy/pattern JSON display
- `EmptyState` - when no event buses exist
- `LoadingSkeleton` - during data fetch

## Error Handling
- Network errors: Show toast notification + retry button
- 404 on detail: Redirect to list with not-found message
- Invalid policy JSON: Display raw string with warning

## Testing Strategy
- Unit tests for API service functions
- Component tests for EventBusTable, EventBusDetailPage
- E2E test: navigate to list, click item, verify detail view
- Mock MSW handlers for EventBridge API responses