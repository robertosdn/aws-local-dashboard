# Spec: Base Dashboard Layout

## Architecture

### Route Structure
```
/                    → Dashboard (default)
/queues              → Queues list
/settings            → Settings
```

### Component Hierarchy
```
App
└── Layout (persistent shell)
    ├── Sidebar (navigation)
    │   ├── Logo/Brand
    │   ├── NavItem (Dashboard)
    │   ├── NavItem (Queues)
    │   └── NavItem (Settings)
    └── MainContent
        ├── Header (page title + actions)
        └── Outlet (page content)
```

## Technical Implementation

### Layout Component (`src/components/layout/Layout.tsx`)
- Wrapper component using React Router's `Outlet`
- Provides sidebar + main content structure
- Handles responsive behavior (CSS Grid/Flexbox)

### Sidebar Component (`src/components/layout/Sidebar.tsx`)
- Fixed position on desktop, drawer on mobile
- Navigation using `<NavLink>` for active state
- Logo/brand at top
- Collapsible trigger button (hamburger menu)
- Connection status badge at the top of the sidebar, using uppercase text `ONLINE` or `OFFLINE`
- `ONLINE` status uses green styling (`emerald`/green palette), while `OFFLINE` uses red styling (`red` palette)
- Status should be derived from a periodic endpoint health check against the configured local MinStack endpoint

### Endpoint Health Check
- Use a polling hook or lightweight fetch loop to test the emulator availability at a fixed interval
- When the endpoint responds successfully, set the badge to `ONLINE` and apply the green variant
- When the request fails or times out, set the badge to `OFFLINE` and apply the red variant
- Keep the check non-blocking for the rest of the dashboard and expose the result to both sidebar and header consumers

### Header Component (`src/components/layout/Header.tsx`)
- Page title from route metadata
- Optional: user menu, notifications, sidebar toggle
- Sticky/fixed at top of main content

### Navigation Data (`src/config/navigation.ts`)
```typescript
export const navigation = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/queues', label: 'Queues', icon: MessageSquare },
  { path: '/settings', label: 'Settings', icon: Settings },
] as const;
```

### Icons
Use `lucide-react` icons (already in deps):
- LayoutDashboard
- MessageSquare
- Settings
- Menu (hamburger)
- ChevronLeft (collapse)

## Styling Approach

### Tailwind Classes
- **Sidebar**: `w-64 min-h-screen bg-sidebar border-r` (desktop)
- **Sidebar Mobile**: `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform`
- **Main**: `flex-1 overflow-auto bg-background`
- **Header**: `sticky top-0 z-10 h-16 border-b bg-background/95 backdrop-blur`

### UI Components
- Build the layout with project-owned components and existing Radix UI primitives where appropriate.
- Consult shadcn/ui as a reference for sidebar, button, separator, and scroll-area patterns; do not download or generate these components from shadcn/ui.

## Responsive Breakpoints
- **Desktop (≥1024px)**: Sidebar always visible
- **Tablet (768-1023px)**: Sidebar collapsible, default open
- **Mobile (<768px)**: Sidebar as drawer, closed by default

## State Management
- **Sidebar open/closed**: Local state in Layout (or Context for cross-component)
- **Active route**: Derived from React Router (`useLocation`)
- **Endpoint status**: Derived from polling state (`ONLINE`/`OFFLINE`) and a green/red visual variant

## File Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── index.ts
│   └── ui/              # Project-owned reusable UI components
├── config/
│   └── navigation.ts
├── routes.ts            # Updated with layout wrapper
└── App.tsx              # Updated to use Layout
```

## Route Configuration (`src/routes.ts`)
```typescript
import { createBrowserRouter } from 'react-router';
import { Layout } from '@/components/layout';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'queues', element: <QueuesPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
```

## Page Placeholders
Create minimal page components for routing verification:
- `src/pages/DashboardPage.tsx`
- `src/pages/QueuesPage.tsx`
- `src/pages/SettingsPage.tsx`

Each renders a simple heading + description for now.