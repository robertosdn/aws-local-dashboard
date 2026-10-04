# Tasks: Base Dashboard Layout

## Phase 1: Navigation Configuration

- [x] Create `src/config/navigation.ts` with navigation items and icons
- [x] Import lucide-react icons

## Phase 2: Layout Components

- [x] Create `src/components/layout/Layout.tsx` (shell with Outlet)
- [x] Create `src/components/layout/Sidebar.tsx` (navigation + active state)
- [x] Create `src/components/layout/Header.tsx` (page title + mobile toggle)
- [x] Create `src/components/layout/index.ts` (barrel export)

## Phase 3: Styling & Responsive

- [x] Add Tailwind CSS variables for sidebar width, header height
- [x] Implement desktop sidebar (fixed, always visible)
- [x] Implement mobile drawer (slide-in, overlay backdrop)
- [x] Add sidebar toggle button in Header (mobile)
- [x] Add smooth transitions for drawer open/close

## Phase 4: Routing Integration

- [x] Update `src/routes.ts` to use Layout as wrapper
- [x] Create page placeholder components:
  - `src/pages/DashboardPage.tsx`
  - `src/pages/QueuesPage.tsx`
  - `src/pages/SettingsPage.tsx`
- [x] Update `src/App.tsx` to use router

## Phase 5: Project UI Components

- [x] Use the project-owned `Button` for the sidebar toggle
- [x] Use the project-owned `Separator` in the sidebar
- [x] Use the project-owned `ScrollArea` for the navigation list
- [x] Apply project design tokens for sidebar, background, borders, and related UI

## Phase 6: Active Route Highlighting

- [x] Use `NavLink` with `isActive` or `className` function
- [x] Style active item with project primary/accent colors
- [x] Ensure keyboard focus styles visible

## Phase 6.1: Live Endpoint Status Badge

- [x] Implement a connection check against the local MinStack endpoint
- [x] Show the badge text as uppercase `ONLINE` when the endpoint is reachable
- [x] Show the badge text as uppercase `OFFLINE` when the endpoint is unreachable
- [x] Apply green styling to the online state and red styling to the offline state
- [x] Ensure the status refreshes automatically while the dashboard remains open

## Phase 7: Verification

- [x] Run `npm run dev` - verify layout renders
- [x] Test navigation between all three routes
- [x] Verify active state highlighting works
- [x] Verify the endpoint badge shows `ONLINE` in green and `OFFLINE` in red
- [x] Test responsive behavior:
  - Desktop: sidebar always visible
  - Mobile: hamburger menu opens drawer
  - Tablet: collapsible sidebar
- [x] Run `npm run lint` - verify no errors
- [x] Run `npm run typecheck` - verify no TypeScript errors
- [x] Run `npm run build` - verify production build succeeds

## Phase 8: Planned Resource Navigation

- [x] Add S3 and DynamoDB sidebar entries with a `Soon` badge
- [x] Add EventBridge (EventBus) and EventBridge (Scheduler) sidebar entries with a `Soon` badge
- [x] Keep EventBridge entries without routes non-interactive and accessible
- [x] Add unit tests for planned-resource labels and disabled navigation metadata
- [x] Verify the sidebar entries and disabled behavior in a browser

## Phase 9: Endpoint Status Polling

- [x] Increase the default endpoint availability polling interval to 30 seconds
- [x] Document the endpoint status polling interval
- [x] Add a unit test for the configured polling interval
- [x] Verify endpoint status polling in a browser
