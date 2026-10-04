# Implementation Tasks: EventBridge EventBus Management

## Phase 1: API Service Layer
- [ ] Create `src/services/eventbridge.ts` with EventBridgeClient configuration
- [ ] Implement `listEventBuses()` function
- [ ] Implement `getEventBus(name: string)` function
- [ ] Implement `listRules(eventBusName: string)` function
- [ ] Implement `listTargetsByRule(ruleName: string, eventBusName: string)` function
- [ ] Add TypeScript types for all response shapes

## Phase 2: React Query Hooks
- [ ] Create `src/hooks/useEventBuses.ts` with `useEventBuses()` hook
- [ ] Create `useEventBus(name)` hook for detail view
- [ ] Create `useEventBusRules(eventBusName)` hook
- [ ] Configure cache keys and stale times

## Phase 3: UI Components
- [ ] Create `src/pages/EventBridge/EventBusListPage.tsx`
- [ ] Create `src/pages/EventBridge/components/EventBusTable.tsx`
- [ ] Create `src/pages/EventBridge/EventBusDetailPage.tsx`
- [ ] Create `src/pages/EventBridge/components/RuleList.tsx`
- [ ] Create `src/pages/EventBridge/components/EventBusPolicyDisplay.tsx`

## Phase 4: Routing & Navigation
- [ ] Add routes in `src/routes.tsx`:
  - `/eventbridge/eventbuses` → EventBusListPage
  - `/eventbridge/eventbuses/:name` → EventBusDetailPage
- [ ] Add EventBridge section to sidebar navigation in `src/components/layout/Sidebar.tsx`
- [ ] Add "Event Buses" navigation item

## Phase 5: Styling & Polish
- [ ] Apply consistent spacing and typography per design system
- [ ] Add loading skeletons for list and detail views
- [ ] Add empty state for no event buses
- [ ] Add refresh button with loading state
- [ ] Format timestamps in user-friendly format

## Phase 6: Testing
- [ ] Unit tests for eventbridge service functions
- [ ] Component tests for EventBusTable and EventBusDetailPage
- [ ] MSW handlers for EventBridge API mocking
- [ ] E2E test: list → click → detail → back navigation

## Phase 7: Documentation
- [ ] Update README with EventBridge EventBus feature overview
- [ ] Add inline code comments for complex logic