# Technical Specification: EventBridge Scheduler Management

## Architecture Overview
This feature adds EventBridge Scheduler management capabilities to the existing React dashboard. It follows the established patterns for AWS service pages in the codebase.

## Data Structures

### ScheduleGroup List Item
```typescript
interface ScheduleGroupListItem {
  Name: string;
  Arn: string;
  CreatedAt: string; // ISO 8601
  ScheduleCount: number;
}
```

### ScheduleGroup Detail
```typescript
interface ScheduleGroupDetail {
  Name: string;
  Arn: string;
  CreatedAt: string;
  Schedules: ScheduleListItem[];
}

interface ScheduleListItem {
  Name: string;
  Arn: string;
  ScheduleExpression: string;
  ScheduleExpressionTimezone: string;
  State: 'ENABLED' | 'DISABLED';
  Target: ScheduleTarget;
  NextInvocationTime?: string;
  LastInvocationTime?: string;
  CreatedAt: string;
}

interface ScheduleTarget {
  Arn: string;
  RoleArn: string;
  Input?: string;
  RetryPolicy?: {
    MaximumEventAgeInSeconds?: number;
    MaximumRetryAttempts?: number;
  };
  DeadLetterConfig?: {
    Arn: string;
  };
}
```

### Schedule Detail
```typescript
interface ScheduleDetail extends ScheduleListItem {
  Description?: string;
  StartDate?: string;
  EndDate?: string;
  FlexibleTimeWindow?: {
    Mode: 'OFF' | 'FLEXIBLE';
    MaximumWindowInMinutes?: number;
  };
}
```

## API Integration

### Endpoints (via localstack/ministack on localhost:4566)
- `ListScheduleGroups` - GET / - Action=ListScheduleGroups
- `GetScheduleGroup` - GET / - Action=GetScheduleGroup&Name={name}
- `ListSchedules` - GET / - Action=ListSchedules&ScheduleGroupName={name}
- `GetSchedule` - GET / - Action=GetSchedule&Name={name}&ScheduleGroupName={groupName}

### AWS SDK Client
Use `@aws-sdk/client-scheduler` with custom endpoint configuration:
```typescript
const client = new SchedulerClient({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
});
```

## Components

### Page Structure
```
src/pages/EventBridge/
├── Scheduler/
│   ├── ScheduleGroupListPage.tsx    # Main list view
│   ├── ScheduleGroupDetailPage.tsx  # Group detail with schedule list
│   └── ScheduleDetailPage.tsx       # Individual schedule detail
└── components/
    ├── ScheduleGroupTable.tsx
    ├── ScheduleTable.tsx
    ├── ScheduleTargetDisplay.tsx
    └── ScheduleExpressionDisplay.tsx
```

### Routing
- `/eventbridge/scheduler/groups` - Schedule group list
- `/eventbridge/scheduler/groups/:groupName` - Group detail with schedules
- `/eventbridge/scheduler/groups/:groupName/schedules/:scheduleName` - Schedule detail

### Navigation Integration
Add to sidebar navigation under "EventBridge" section:
- Event Buses (from feature 009)
- Scheduler Groups (this feature)
- (Future) Schedules

## State Management
- Use React Query (TanStack Query) for server state
- Cache key: `['eventbridge', 'scheduler', 'groups']` for group list
- Cache key: `['eventbridge', 'scheduler', 'group', groupName]` for group detail
- Cache key: `['eventbridge', 'scheduler', 'schedule', groupName, scheduleName]` for schedule detail
- Invalidate on refresh

## UI Components (Project Primitives)
Reuse existing primitives from `src/components/ui/`:
- `Table` - for schedule group and schedule lists
- `Card` - for detail sections
- `Badge` - for schedule state (ENABLED/DISABLED)
- `CodeBlock` - for target input/JSON display
- `EmptyState` - when no groups/schedules exist
- `LoadingSkeleton` - during data fetch
- `Tabs` - for organizing schedule detail sections

## Schedule Expression Formatting
Display human-readable descriptions for common expressions:
- `rate(5 minutes)` → "Every 5 minutes"
- `cron(0 12 * * ? *)` → "Daily at 12:00 PM UTC"
- Show timezone next to expression

## Error Handling
- Network errors: Show toast notification + retry button
- 404 on detail: Redirect to parent list with not-found message
- Invalid JSON in target input: Display raw string with warning

## Testing Strategy
- Unit tests for API service functions
- Component tests for ScheduleGroupTable, ScheduleTable, ScheduleDetailPage
- E2E test: navigate to groups, click group, click schedule, verify detail view
- Mock MSW handlers for Scheduler API responses