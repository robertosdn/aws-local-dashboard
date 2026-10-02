# Product Requirements Document: Connection Settings

## Overview
Allow users to configure the AWS emulator endpoint (host and port) through a settings page, with persistence in browser storage and application-wide effect.

## User Stories

### US-001: View Current Connection Settings
**As a** developer using the dashboard  
**I want to** see the currently configured endpoint  
**So that** I know which emulator I'm connected to

**Acceptance Criteria:**
- Display current host and port in settings page
- Show connection status (online/offline) with visual indicator
- Read-only display of effective endpoint URL

### US-002: Change Connection Endpoint
**As a** developer  
**I want to** modify the host and port  
**So that** I can connect to different emulators (ministack, LocalStack, custom)

**Acceptance Criteria:**
- Input fields for host (default: localhost) and port (default: 4566)
- Validation: host required, port must be valid number 1-65535
- Save button persists to localStorage
- Cancel button discards changes
- Toast confirmation on save

### US-003: Persistent Settings Across Sessions
**As a** developer  
**I want to** have my endpoint settings remembered  
**So that** I don't need to reconfigure on each visit

**Acceptance Criteria:**
- Settings saved to localStorage
- Loaded on app initialization
- Survives browser close/restart
- Fallback to defaults if no saved settings

### US-004: Application-Wide Effect
**As a** developer  
**I want to** change the endpoint and have all features use it immediately  
**So that** I don't need to refresh the page

**Acceptance Criteria:**
- SQS client uses new endpoint immediately after save
- Queue list auto-refreshes with new endpoint
- All API calls route to new endpoint
- No page reload required

## Non-Functional Requirements
- Settings stored in localStorage (key: `aws-dashboard-settings`)
- Default: `http://localhost:4566`, region `us-east-1`
- Input validation with inline error messages
- Accessible form (labels, ARIA, keyboard navigation)
- Responsive design for mobile/desktop