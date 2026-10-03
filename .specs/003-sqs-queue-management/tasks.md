# Implementation Tasks: SQS Queue Management

## Phase 1: Project Setup & Types

- [X] Initialize React + TypeScript + Vite project
- [X] Install dependencies: react-router-dom, @aws-sdk/client-sqs, @tanstack/react-query, lucide-react, clsx, tailwind-merge
- [X] Configure Tailwind CSS with project design tokens, using common UI patterns as reference
- [X] Create `src/features/sqs/types/sqs.ts` with Queue/Message interfaces
- [X] Set up environment variables (VITE_AWS_ENDPOINT, VITE_AWS_REGION)

## Phase 2: API Client

- [X] Create `src/features/sqs/api/sqs.ts` with SQSClient configuration
- [X] Implement `listQueues()` - ListQueues + GetQueueAttributes for each
- [X] Implement `receiveMessages(queueUrl)` - ReceiveMessage for peek
- [X] Implement `purgeQueue(queueUrl)` - PurgeQueue action
- [X] Add error handling with typed error responses

## Phase 3: React Query Hooks

- [X] Create `src/features/sqs/hooks/useQueues.ts`
  - useQuery for queue list with refetch interval
  - Invalidate on purge success
- [X] Create `src/features/sqs/hooks/useQueueMessages.ts`
  - useQuery enabled when queueUrl provided
  - Stale time: 30 seconds
- [X] Create `src/features/sqs/hooks/usePurgeQueue.ts`
  - useMutation with onSuccess invalidating queues

## Phase 4: UI Components

- [X] Create `src/features/sqs/components/QueueTable.tsx`
  - TanStack Table or simple HTML table
  - Loading skeleton rows
  - Empty state
- [X] Create `src/features/sqs/components/QueueRow.tsx`
  - Queue name (link to messages)
  - Message counts badges
  - View Messages button
  - Purge button (opens dialog) with a cleaning/brush icon
  - Omit the "Open in AWS console" action
- [X] Create `src/features/sqs/components/MessageViewer.tsx`
  - Modal (Dialog) component
  - MessageList child
  - Close handler
- [X] Create `src/features/sqs/components/MessageList.tsx`
  - Paginated table (10 per page)
  - JSON formatted body display
  - Message attributes expandable row
- [X] Create `src/features/sqs/components/PurgeConfirmDialog.tsx`
  - AlertDialog with queue name
  - Destructive confirm button
  - Calls purge mutation
- [X] Create `src/features/sqs/components/RefreshButton.tsx`
  - Icon button with spin animation
  - Calls refetch from useQueues

## Phase 5: Page & Routing

- [X] Create `src/pages/SQSQueuesPage.tsx` (implemented as QueuesPage.tsx)
  - Page header with title + refresh button
  - QueueTable component
  - MessageViewer modal state
- [X] Add `/queues` route in router config (already existed)
- [X] Add navigation link in main layout/sidebar (already existed)

## Phase 6: Polish & Validation

- [X] Add toast notifications (success/error)
- [X] Implement responsive design (mobile table scroll)
- [X] Add keyboard navigation support
- [X] Add ARIA labels for accessibility
- [X] Test with ministack running on localhost:4566
- [X] Verify: list queues, view messages, purge queue
- [X] Verify: queue row has no AWS console link and uses a cleaning icon for purge
- [X] Run lint and typecheck

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