# PRD: Lambda Functions Feature

## Product Overview
Add Lambda functions management to the AWS Local Dashboard. Users can list, view details, and invoke Lambda functions running on the local AWS-compatible endpoint (ministack on localhost:4566).

## Target Users
- Developers testing Lambda functions locally
- Teams using ministack/localstack for local AWS development

## User Stories

### US-1: List Lambda Functions
**As a** developer  
**I want to** see all Lambda functions in my local environment  
**So that** I can verify deployments and select functions to test

**Acceptance Criteria:**
- Display function name, runtime, handler, last modified, code size
- Show loading state while fetching
- Show error state with retry option
- Auto-refresh every 60 seconds

### US-2: View Function Details
**As a** developer  
**I want to** click a function to see its full configuration  
**So that** I can verify environment variables, timeout, memory, etc.

**Acceptance Criteria:**
- Modal/drawer with function configuration
- Show: runtime, handler, timeout, memory, env vars, layers, VPC config
- Copy function ARN button

### US-3: Invoke Function
**As a** developer  
**I want to** invoke a Lambda function with custom payload  
**So that** I can test function behavior locally

**Acceptance Criteria:**
- JSON editor for request payload
- Show response payload, status code, logs
- Show execution duration
- Handle invocation errors gracefully

### US-4: Create Function (Optional)
**As a** developer  
**I want to** create a new Lambda function from the dashboard  
**So that** I can quickly prototype without CLI

**Acceptance Criteria:**
- Form with required fields (name, runtime, handler, code)
- Code upload via zip or inline editor
- Success feedback on creation

## Non-Functional Requirements
- Reuse existing SQS patterns: API layer, React Query hooks, component patterns
- Share AWS client factory from `src/services/aws.ts`
- Use Settings Context for endpoint/region configuration
- Follow existing UI patterns (QueueTable → FunctionTable, MessageViewer → InvocationPanel)
- Maintain consistent error handling and toast notifications

## Out of Scope
- Real AWS credential management (use local emulator)
- Function code editing beyond inline JSON
- Versioning/aliases management
- Event source mappings