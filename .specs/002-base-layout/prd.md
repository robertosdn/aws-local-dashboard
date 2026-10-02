# PRD: Base Dashboard Layout

## Problem Statement
Provide a consistent, navigable shell for the AWS Local Dashboard so users can switch between AWS resource types and monitor their connection to the local emulator. Also establish the foundational UI components needed to display and edit resources across all resource types.

## Requirements

### Functional
- Persistent sidebar showing all available AWS resource types
- Connection status card at the top of the sidebar showing connectivity to the local stack endpoint
- Connection status badge must display the literal labels `ONLINE` and `OFFLINE` in uppercase, with `ONLINE` rendered in green and `OFFLINE` in red
- The status indicator must continuously reflect the current emulator availability and update visually when the endpoint changes between online and offline states
- Main content area that updates when user selects a different resource type
- Four initial resource types: SQS, S3, Lambda, DynamoDB
- Clear visual indication of which resource type is currently active
- Works on desktop, tablet, and mobile screens
- **Foundational UI components** for resource display and editing:
  - Lists/tables for resource collections
  - Cards for resource details and summaries
  - Input boxes for text/name/value entry
  - Checkboxes for boolean flags and multi-select
  - Tabs for organizing resource detail views

### Non-Functional
- Clean, professional appearance suitable for a developer tool
- Immediate visual feedback when switching resource types
- Connection status clearly visible (connected/disconnected)
- Keyboard navigable for accessibility
- No jarring layout shifts during navigation
- Consistent component styling across all resource types

## Success Criteria
- User can reach all four resource types from the sidebar
- Current resource type is obvious at a glance
- Connection status is visible without scrolling
- Badge clearly communicates `ONLINE` in green or `OFFLINE` in red, with no ambiguity about current emulator state
- Layout adapts gracefully to different screen sizes
- Navigation feels instantaneous
- UI component library provides all building blocks needed for resource pages

## Out of Scope
- Content inside each resource type page (queue lists, bucket lists, etc.)
- User authentication or preferences
- Data loading or error states within resource pages
- Sidebar collapse/expand animations
- Actual AWS API calls or data fetching