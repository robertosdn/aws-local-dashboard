# Implementation Tasks: EventBridge Scheduler Management

## Phase 1: API Service Layer
- [ ] Create `src/services/scheduler.ts` with SchedulerClient configuration
- [ ] Implement `listScheduleGroups()` function
- [ ] Implement `getScheduleGroup(name: string)` function
- [ ] Implement `listSchedules(scheduleGroupName: string)` function
- [ ] Implement `getSchedule(name: string, groupName: string)` function
- [ ] Add TypeScript types for all response shapes

## Phase 2: React Query Hooks
- [ ] Create `src/hooks/useScheduler.ts` with `useScheduleGroups()` hook
- [ ] Create `useScheduleGroup(name)` hook for group detail
- [ ] Create `useSchedules(groupName)` hook
- [ ] Create `useSchedule(groupName, scheduleName)` hook
- [ ] Configure cache keys and stale times

## Phase 3: UI Components
- [ ] Create `src/pages/EventBridge/Scheduler/ScheduleGroupListPage.tsx`
- [ ] Create `src/pages/EventBridge/Scheduler/components/ScheduleGroupTable.tsx`
- [ ] Create `src/pages/EventBridge/Scheduler/ScheduleGroupDetailPage.tsx`
- [ ] Create `src/pages/EventBridge/Scheduler/components/ScheduleTable.tsx`
- [ ] Create `src/pages/EventBridge/Scheduler/ScheduleDetailPage.tsx`
- [ ] Create `src/pages/EventBridge/Scheduler/components/ScheduleTargetDisplay.tsx`
- [ ] Create `src/pages/EventBridge/Scheduler/components/ScheduleExpressionDisplay.tsx`

## Phase 4: Routing & Navigation
- [ ] Add routes in `src/routes.tsx`:
  - `/eventbridge/scheduler/groups` → ScheduleGroupListPage
  - `/eventbridge/scheduler/groups/:groupName` → ScheduleGroupDetailPage
  - `/eventbridge/scheduler/groups/:groupName/schedules/:scheduleName` → ScheduleDetailPage
- [ ] Add "Scheduler Groups" navigation item to EventBridge section in Sidebar

## Phase 5: Styling & Polish
- [ ] Apply consistent spacing and typography per design system
- [ ] Add loading skeletons for all list and detail views
- [ ] Add empty states for no groups/schedules
- [ ] Add refresh buttons with loading states
- [ ] Format timestamps in user-friendly format
- [ ] Add human-readable schedule expression formatting
- [ ] Add timezone display for schedules

## Phase 6: Testing
- [ ] Unit tests for scheduler service functions
- [ ] Component tests for ScheduleGroupTable, ScheduleTable, ScheduleDetailPage
- [ ] MSW handlers for Scheduler API mocking
- [ ] E2E test: groups list → group detail → schedule detail → back navigation

## Phase 7: Documentation
- [ ] Update README with EventBridge Scheduler feature overview
- [ ] Add inline code comments for complex logic