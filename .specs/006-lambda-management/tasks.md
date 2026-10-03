# Implementation Tasks: Lambda Management

## Phase 1: Foundation & Types
- [X] Create TypeScript types in `src/features/lambda/types/event-source-mapping.ts` for all interfaces
- [X] Create `src/features/lambda/api/lambda-service.ts` with API client methods
- [X] Create `src/features/lambda/api/sqs-service.ts` for queue attribute fetching
- [X] Add Lambda routes to React Router configuration

## Phase 2: Lambda List Page
- [X] Create `src/pages/LambdaPage.tsx` with table layout (existing, enhanced)
- [X] Implement `LambdaTable` component with sorting/filtering (existing)
- [X] Add pagination logic and controls (existing)
- [X] Add search/filter toolbar (existing)
- [X] Implement row click navigation to detail

## Phase 3: Lambda Detail Page
- [X] Create `src/pages/LambdaDetailPage.tsx` with tab navigation
- [X] Create `ConfigurationTab` component (inline in detail page)
- [X] Create `EventSourcesTab` component (uses EventSourceMappingList)
- [X] Implement data fetching with proper loading/error states
- [X] Add breadcrumb navigation (back button)

## Phase 4: Event Source Mappings
- [X] Create `src/features/lambda/components/EventSourceMappingList.tsx`
- [X] Implement mapping table with state badges
- [X] Add SQS queue resolution (ARN → name + attributes)
- [X] Implement Enable/Disable toggle (UpdateEventSourceMapping)
- [X] Implement Delete mapping with confirmation modal
- [X] Add "Create Mapping" button (stretch - UI only, disabled)

## Phase 5: Polish & Integration
- [X] Add Lambda to main navigation/sidebar (existing)
- [X] Ensure responsive design works on mobile
- [X] Add empty states for no functions/no mappings
- [X] Add proper error boundaries (error states in components)
- [X] Test with localstack/ministack emulator
- [X] Verify all TypeScript types compile
- [X] Run lint and format checks

## Phase 6: Documentation
- [ ] Update README with Lambda feature documentation
- [ ] Add architecture diagram to docs/architecture.md
- [ ] Document API endpoints used