# Technical Specification: SQS Queue Management

## Architecture

### Components
```
src/
├── features/sqs/
│   ├── components/
│   │   ├── QueueTable.tsx          # Lists queues with actions
│   │   ├── QueueRow.tsx            # Single queue row with purge button
│   │   ├── MessageViewer.tsx       # Modal/page for viewing messages
│   │   ├── MessageList.tsx         # Paginated message table
│   │   ├── PurgeConfirmDialog.tsx  # Confirmation dialog
│   │   └── RefreshButton.tsx       # Refresh queue list
│   ├── hooks/
│   │   ├── useQueues.ts            # Fetch and manage queue list
│   │   ├── useQueueMessages.ts     # Fetch messages for a queue
│   │   └── usePurgeQueue.ts        # Purge mutation
│   ├── api/
│   │   └── sqs.ts                  # SQS API client functions
│   ├── types/
│   │   └── sqs.ts                  # TypeScript interfaces
│   └── index.ts                    # Public exports
├── pages/
│   └── SQSQueuesPage.tsx           # Main page component
└── router/
    └── routes.tsx                  # Add /sqs route
```

## Data Structures

### Queue (from ListQueues + GetQueueAttributes)
```typescript
interface SQSQueue {
  url: string;
  name: string;
  attributes: {
    ApproximateNumberOfMessages: string;
    ApproximateNumberOfMessagesNotVisible: string;
    ApproximateNumberOfMessagesDelayed: string;
    CreatedTimestamp?: string;
    LastModifiedTimestamp?: string;
    VisibilityTimeout?: string;
    MaximumMessageSize?: string;
    MessageRetentionPeriod?: string;
  };
}
```

### Message (from ReceiveMessage)
```typescript
interface SQSMessage {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes: {
    ApproximateReceiveCount?: string;
    SentTimestamp?: string;
    SenderId?: string;
    ApproximateFirstReceiveTimestamp?: string;
  };
  messageAttributes?: Record<string, { dataType: string; stringValue?: string; binaryValue?: Blob }>;
}
```

## API Client (src/features/sqs/api/sqs.ts)

```typescript
const SQS_ENDPOINT = import.meta.env.VITE_AWS_ENDPOINT || 'http://localhost:4566';
const REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

async function listQueues(): Promise<SQSQueue[]> {
  // 1. ListQueues -> queue URLs
  // 2. For each URL, GetQueueAttributes (All) -> attributes
  // 3. Combine into SQSQueue[]
}

async function getQueueAttributes(queueUrl: string): Promise<SQSQueue['attributes']> {
  // GetQueueAttributes action with AttributeNames=All
}

async function receiveMessages(queueUrl: string, maxMessages = 10): Promise<SQSMessage[]> {
  // ReceiveMessage with:
  // - MaxNumberOfMessages=10
  // - WaitTimeSeconds=0 (short polling for peek)
  // - AttributeNames=All
  // - MessageAttributeNames=All
}

async function purgeQueue(queueUrl: string): Promise<void> {
  // PurgeQueue action
}
```

## AWS SDK v3 Integration

```typescript
// Use @aws-sdk/client-sqs with custom endpoint
import { SQSClient, ListQueuesCommand, GetQueueAttributesCommand, ReceiveMessageCommand, PurgeQueueCommand } from '@aws-sdk/client-sqs';

const client = new SQSClient({
  region: REGION,
  endpoint: SQS_ENDPOINT,
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});
```

## State Management

### useQueues Hook
- `queues: SQSQueue[]`
- `loading: boolean`
- `error: Error | null`
- `refetch(): Promise<void>`

### useQueueMessages Hook
- `messages: SQSMessage[]`
- `loading: boolean`
- `error: Error | null`
- `fetch(queueUrl: string): Promise<void>`

### usePurgeQueue Hook
- `mutate(queueUrl: string): Promise<void>`
- `pending: boolean`

## UI/UX Details

### Queue Table Columns
| Column | Source | Notes |
|--------|--------|-------|
| Name | Queue URL parsing | Last segment after final `/` |
| URL | Queue.url | Truncated with tooltip |
| Messages | ApproximateNumberOfMessages | Visible count |
| In Flight | ApproximateNumberOfMessagesNotVisible | Processing |
| Delayed | ApproximateNumberOfMessagesDelayed | Scheduled |
| Actions | - | View Messages, Purge (cleaning brush icon); no AWS console link |

### Queue Row Actions
- Provide actions to view messages and purge the queue
- Use a cleaning/brush icon for the purge action instead of a trash icon
- Do not provide an "Open in AWS console" link

### Message Viewer
- Modal overlay (preferred) or separate route `/sqs/:queueName/messages`
- Table: Message ID | Body (JSON formatted) | Attributes | Receive Count
- Pagination: Previous/Next (10 per page)
- Close button returns to queue list

### Purge Confirmation
- shadcn/ui AlertDialog
- Title: "Purge Queue"
- Description: "This will permanently delete all messages in [queue name]. This action cannot be undone."
- Buttons: Cancel, Purge (destructive variant)

## Routing
```
/sqs                    -> SQSQueuesPage (list)
/sqs/:queueName/messages -> MessageViewer (optional, modal preferred)
```

## Error Handling
- Network errors: Toast "Failed to connect to localhost:4566"
- AWS errors: Display error code + message from response
- Empty states: "No queues found" / "No messages in queue"

## Security
- No credentials in code - uses dummy credentials for local emulator
- Endpoint configurable via VITE_AWS_ENDPOINT env var
- All requests go to configured endpoint only