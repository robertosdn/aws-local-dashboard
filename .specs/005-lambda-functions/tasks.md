# Implementation Tasks: Lambda Functions Feature

## Phase 1: Setup & Types
- [X] Add `@aws-sdk/client-lambda` dependency
- [X] Create `src/features/lambda/types/lambda.ts` with type definitions
- [X] Create `src/features/lambda/index.ts` barrel export

## Phase 2: Shared AWS Client
- [X] Extend `src/services/aws.ts` with `createLambdaClient()` factory
- [X] Export `createLambdaClient` and `AwsClientConfig` (already exists)

## Phase 3: API Layer
- [X] Create `src/features/lambda/api/lambda.ts` with:
  - [X] `listFunctions(config)` - ListFunctionsCommand
  - [X] `getFunction(name, config)` - GetFunctionCommand
  - [X] `invokeFunction(request, config)` - InvokeCommand
  - [ ] `createFunction(params, config)` - CreateFunctionCommand (optional) - **deferred**

## Phase 4: Hooks Layer
- [X] Create `src/features/lambda/hooks/useFunctions.ts` - mirrors `useQueues`
- [X] Create `src/features/lambda/hooks/useFunction.ts` - get single function
- [X] Create `src/features/lambda/hooks/useInvokeFunction.ts` - mutation hook
- [ ] Create `src/features/lambda/hooks/useCreateFunction.ts` - mutation hook (optional) - **deferred**
- [X] Create `src/features/lambda/hooks/index.ts` barrel export

## Phase 5: Components
- [X] Create `src/features/lambda/components/FunctionTable.tsx` - mirrors `QueueTable`
- [X] Create `src/features/lambda/components/FunctionRow.tsx` - mirrors `QueueRow`
- [X] Create `src/features/lambda/components/FunctionDetailDialog.tsx` - mirrors `MessageViewer`
- [X] Create `src/features/lambda/components/InvocationPanel.tsx` - invoke + show response
- [ ] Create `src/features/lambda/components/CreateFunctionDialog.tsx` (optional) - **deferred**
- [X] Create `src/features/lambda/components/RefreshButton.tsx` - reuse existing (from SQS)
- [X] Create `src/features/lambda/components/index.ts` barrel export

## Phase 6: Page Integration
- [X] Update `src/pages/LambdaPage.tsx` - full implementation using hooks + components
- [X] Verify route in `src/routes.ts` works

## Phase 7: Verification
- [X] Run `npm run typecheck` - ensure no TypeScript errors
- [X] Run `npm run lint` - ensure no lint errors
- [X] Run `npm run build` - ensure production build succeeds
- [X] Start ministack container: `docker compose up -d`
- [X] Start dev server: `npm run dev`
- [X] Manual E2E test in browser:
  - [X] Navigate to /lambda page
  - [X] Verify functions list loads
  - [X] Click function to view details
  - [X] Invoke function with test payload
  - [X] Verify response/logs display
  - [X] Test error handling (invalid payload, function error)
  - [X] Test refresh button
  - [X] Test settings change (endpoint/region) triggers refetch

## Phase 8: Documentation
- [X] Update `docs/architecture.md` if needed
- [ ] Add any inline code comments for complex logic - **not needed**

**Notes:**
- Optional create function feature deferred to future iteration
- All core functionality implemented and verified
- Reused existing SQS patterns extensively (client factory, API layer, hooks, UI components)