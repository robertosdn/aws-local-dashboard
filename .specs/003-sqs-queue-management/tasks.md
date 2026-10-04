# Implementation Tasks: SQS Queue Management

## Phase 1: Project Setup & Types

- [x] Initialize React + TypeScript + Vite project
- [x] Install dependencies: react-router-dom, @aws-sdk/client-sqs, @tanstack/react-query, lucide-react, clsx, tailwind-merge
- [x] Configure Tailwind CSS with project design tokens, using common UI patterns as reference
- [x] Create `src/features/sqs/types/sqs.ts` with Queue/Message interfaces
- [x] Set up environment variables (VITE_AWS_ENDPOINT, VITE_AWS_REGION)

## Phase 2: API Client

- [x] Create `src/features/sqs/api/sqs.ts` with SQSClient configuration
- [x] Implement `listQueues()` - ListQueues + GetQueueAttributes for each
- [x] Implement `receiveMessages(queueUrl)` - ReceiveMessage for peek
- [x] Implement `purgeQueue(queueUrl)` - PurgeQueue action
- [x] Add error handling with typed error responses

## Phase 3: React Query Hooks

- [x] Create `src/features/sqs/hooks/useQueues.ts`
  - useQuery for queue list with refetch interval
  - Invalidate on purge success
- [x] Create `src/features/sqs/hooks/useQueueMessages.ts`
  - useQuery enabled when queueUrl provided
  - Stale time: 30 seconds
- [x] Create `src/features/sqs/hooks/usePurgeQueue.ts`
  - useMutation with onSuccess invalidating queues

## Phase 4: UI Components

- [x] Create `src/features/sqs/components/QueueTable.tsx`
  - TanStack Table or simple HTML table
  - Loading skeleton rows
  - Empty state
- [x] Create `src/features/sqs/components/QueueRow.tsx`
  - Queue name (link to messages)
  - Message counts badges
  - View Messages button
  - Purge button (opens dialog) with a cleaning/brush icon
  - Omit the "Open in AWS console" action
- [x] Create `src/features/sqs/components/MessageViewer.tsx`
  - Modal (Dialog) component
  - MessageList child
  - Close handler
- [x] Create `src/features/sqs/components/MessageList.tsx`
  - Paginated table (10 per page)
  - JSON formatted body display
  - Message attributes expandable row
- [x] Create `src/features/sqs/components/PurgeConfirmDialog.tsx`
  - AlertDialog with queue name
  - Destructive confirm button
  - Calls purge mutation
- [x] Create `src/features/sqs/components/RefreshButton.tsx`
  - Icon button with spin animation
  - Calls refetch from useQueues

## Phase 5: Page & Routing

- [x] Create `src/pages/SQSQueuesPage.tsx` (implemented as QueuesPage.tsx)
  - Page header titled `Queues` with the SQS service label and refresh button
  - QueueTable component
  - MessageViewer modal state
- [x] Add `/queues` route in router config (already existed)
- [x] Add navigation link in main layout/sidebar (already existed)

## Phase 6: Polish & Validation

- [x] Add toast notifications (success/error)
- [x] Implement responsive design (mobile table scroll)
- [x] Add keyboard navigation support
- [x] Add ARIA labels for accessibility
- [x] Test with ministack running on localhost:4566
- [x] Verify: list queues, view messages, purge queue
- [x] Verify: queue row has no AWS console link and uses a cleaning icon for purge
- [x] Run lint and typecheck

## Dependencies to Install

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@aws-sdk/client-sqs": "^3.450.0",
    "@tanstack/react-query": "^5.0.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.50.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```
