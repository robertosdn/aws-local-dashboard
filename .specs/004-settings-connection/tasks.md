# Implementation Tasks: Connection Settings

## Phase 1: Types & Persistence

- [X] Create `src/features/settings/types/settings.ts` with ConnectionSettings interface and defaults
- [X] Create `src/features/settings/api/testConnection.ts` with health check function
- [X] Implement localStorage load/save utilities with error handling

## Phase 2: Settings Context & Hook

- [X] Create `src/features/settings/context/SettingsContext.tsx` with SettingsProvider
- [X] Create `src/features/settings/hooks/useSettings.ts` - main settings hook
- [X] Create `src/features/settings/hooks/useConnectionTest.ts` - test connection mutation
- [X] Update `src/main.tsx` to wrap App with SettingsProvider

## Phase 3: AWS Service Integration

- [X] Pass endpoint and region from settings into SQS client creation
- [X] Pass active connection settings through the SQS API functions
- [X] Include endpoint and region in the SQS query keys
- [X] Update queue listing, message reading, and purge hooks to use active settings

## Phase 4: UI Components

- [X] Create `src/features/settings/components/ConnectionForm.tsx` with validation
- [X] Create `src/features/settings/components/ConnectionStatus.tsx` with indicator
- [X] Create `src/features/settings/components/SettingsPage.tsx` - main page layout
- [X] Add form fields: host, port, region, HTTPS toggle
- [X] Add Save, Cancel, Test Connection, Reset buttons
- [X] Add inline validation errors
- [X] Add loading/disabled states

## Phase 5: Settings Page Integration

- [X] Update `src/pages/SettingsPage.tsx` to use new SettingsPage component
- [X] Ensure sidebar navigation already points to /settings (exists)
- [X] Test persistence across browser sessions

## Phase 6: Application-Wide Effect

- [X] Verify SQS queue list updates after settings change (auto-invalidate)
- [X] Verify message viewer works with new endpoint
- [X] Verify purge uses the active endpoint configuration
- [X] Test with MinStack on an alternate host (`127.0.0.1`)
- [ ] Test with LocalStack

## Phase 7: Polish & Validation

- [X] Add toast notifications for save/test/reset actions
- [X] Add keyboard navigation support
- [X] Add ARIA labels for accessibility
- [X] Implement responsive design
- [X] Verify invalid port displays an inline error and Cancel restores saved values
- [X] Run lint and typecheck
- [X] Test complete flow: change settings → save → verify queues reload

## Phase 8: Background Connection Status
- [X] Poll endpoint availability every 30 seconds while connection status consumers are mounted
- [X] Verify the configured polling interval with a unit test and browser check

## Dependencies to Install

```json
{
  "dependencies": {
    "@radix-ui/react-label": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.0"
  }
}
```

(Note: Most UI dependencies already installed - Label may be needed)