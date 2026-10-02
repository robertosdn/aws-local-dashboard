# Implementation Tasks: Lambda Management

## Phase 1: Foundation & Types
- [ ] Create TypeScript types in `src/types/lambda.ts` for all interfaces
- [ ] Create `src/services/lambdaService.ts` with API client methods
- [ ] Create `src/services/sqsService.ts` for queue attribute fetching
- [ ] Add Lambda routes to React Router configuration

## Phase 2: Lambda List Page
- [ ] Create `src/pages/LambdaListPage.tsx` with table layout
- [ ] Implement `LambdaTable` component with sorting/filtering
- [ ] Add pagination logic and controls
- [ ] Add search/filter toolbar
- [ ] Implement row click navigation to detail

## Phase 3: Lambda Detail Page
- [ ] Create `src/pages/LambdaDetailPage.tsx` with tab navigation
- [ ] Create `LambdaConfigurationTab` component
- [ ] Create `LambdaEventSourcesTab` component
- [ ] Implement data fetching with proper loading/error states
- [ ] Add breadcrumb navigation

## Phase 4: Event Source Mappings
- [ ] Create `src/components/EventSourceMappingList.tsx`
- [ ] Implement mapping table with state badges
- [ ] Add SQS queue resolution (ARN → name + attributes)
- [ ] Implement Enable/Disable toggle (UpdateEventSourceMapping)
- [ ] Implement Delete mapping with confirmation modal
- [ ] Add "Create Mapping" button (stretch - UI only)

## Phase 5: Polish & Integration
- [ ] Add Lambda to main navigation/sidebar
- [ ] Ensure responsive design works on mobile
- [ ] Add empty states for no functions/no mappings
- [ ] Add proper error boundaries
- [ ] Test with localstack/ministack emulator
- [ ] Verify all TypeScript types compile
- [ ] Run lint and format checks

## Phase 6: Documentation
- [ ] Update README with Lambda feature documentation
- [ ] Add architecture diagram to docs/architecture.md
- [ ] Document API endpoints used