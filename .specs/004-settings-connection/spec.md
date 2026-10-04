# Technical Specification: Connection Settings

## Architecture

### Components
```
src/
├── features/settings/
│   ├── components/
│   │   ├── SettingsPage.tsx         # Main settings page
│   │   ├── ConnectionForm.tsx       # Host/port form
│   │   └── ConnectionStatus.tsx     # Status indicator
│   ├── hooks/
│   │   ├── useSettings.ts           # Settings state + persistence
│   │   └── useConnectionTest.ts     # Test connection mutation
│   ├── api/
│   │   └── testConnection.ts        # Health check endpoint
│   ├── types/
│   │   └── settings.ts              # Settings interfaces
│   ├── context/
│   │   └── SettingsContext.tsx      # React context for global access
│   └── index.ts                     # Public exports
├── services/
│   └── aws.ts                       # Updated to use settings context
└── App.tsx                          # Wrap with SettingsProvider
```

## Data Structures

### Settings (src/features/settings/types/settings.ts)
```typescript
interface ConnectionSettings {
  host: string;           // e.g., "localhost", "127.0.0.1", "host.docker.internal"
  port: number;           // e.g., 4566
  region: string;         // e.g., "us-east-1"
  useHttps: boolean;      // default: false
}

interface SettingsState {
  settings: ConnectionSettings;
  loading: boolean;
  saving: boolean;
  testResult: 'idle' | 'testing' | 'success' | 'error';
  testError?: string;
}

const DEFAULT_SETTINGS: ConnectionSettings = {
  host: 'localhost',
  port: 4566,
  region: 'us-east-1',
  useHttps: false,
};

const STORAGE_KEY = 'aws-dashboard-settings';
```

### Computed Endpoint
```typescript
function buildEndpoint(settings: ConnectionSettings): string {
  const protocol = settings.useHttps ? 'https' : 'http';
  return `${protocol}://${settings.host}:${settings.port}`;
}
```

## Settings Context (src/features/settings/context/SettingsContext.tsx)

```typescript
interface SettingsContextValue {
  settings: ConnectionSettings;
  endpoint: string;
  saveSettings: (settings: ConnectionSettings) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage on mount
  // Provide context value
  // Handle persistence
};
```

## Persistence Layer

### localStorage Operations
```typescript
function loadSettings(): ConnectionSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: ConnectionSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
```

## AWS Client Integration (src/services/aws.ts)

```typescript
// SQS query hooks read active settings and pass them into API functions.
export function createSqsClient(config: { endpoint?: string; region?: string } = {}) {
  return new SQSClient({
    region: config.region ?? 'us-east-1',
    endpoint: config.endpoint ?? 'http://localhost:4566',
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  });
}

// API functions accept the current endpoint and region. Query keys include both values.
// Saving settings invalidates all ['sqs'] queries so active views reload immediately.
```

## Settings Page UI

### Layout
- Card-based layout with sections
- **Connection** section: host, port, region, HTTPS toggle
- **Actions**: Save, Cancel, Test Connection, Reset to Defaults
- **Status**: Connection indicator with last tested timestamp

### ConnectionForm Component
```tsx
<form onSubmit={handleSubmit}>
  <div className="grid gap-4">
    <div className="grid gap-2">
      <Label htmlFor="host">Host</Label>
      <Input id="host" value={host} onChange={e => setHost(e.target.value)} />
      {hostError && <p className="text-red-400 text-sm">{hostError}</p>}
    </div>
    <div className="grid gap-2">
      <Label htmlFor="port">Port</Label>
      <Input id="port" type="number" value={port} onChange={e => setPort(Number(e.target.value))} />
      {portError && <p className="text-red-400 text-sm">{portError}</p>}
    </div>
    <div className="grid gap-2">
      <Label htmlFor="region">Region</Label>
      <Input id="region" value={region} onChange={e => setRegion(e.target.value)} />
    </div>
    <div className="flex items-center gap-2">
      <Input id="https" type="checkbox" checked={useHttps} onChange={e => setUseHttps(e.target.checked)} />
      <Label htmlFor="https">Use HTTPS</Label>
    </div>
  </div>
  <div className="flex gap-2 mt-6">
    <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
    <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
    <Button type="button" variant="outline" onClick={handleTest} disabled={testing}>
      {testing ? 'Testing...' : 'Test Connection'}
    </Button>
    <Button type="button" variant="ghost" onClick={handleReset}>Reset to Defaults</Button>
  </div>
</form>
```

## Connection Test

### Health Check Endpoint
```typescript
// SQS ListQueues with max 1 queue as lightweight health check
async function testConnection(endpoint: string, region: string): Promise<boolean> {
  const client = new SQSClient({ region, endpoint, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } });
  await client.send(new ListQueuesCommand({ MaxResults: 1 }));
  return true;
}
```

### Background Connection Status Polling
- The application-wide endpoint status hook (`src/lib/useEndpointStatus.ts`) checks the configured endpoint immediately when mounted.
- While mounted, it repeats the availability check every 30 seconds.
- A successful endpoint response sets the status to `ONLINE`; a failed or timed-out check sets it to `OFFLINE`.
- Changing the configured endpoint restarts the check using the new endpoint.

## React Query Integration

### Invalidating Queries on Settings Change
```typescript
// SettingsProvider saveSettings persists the new value, updates context, and invalidates
// queryClient.invalidateQueries({ queryKey: ['sqs'] });
```

## Routing
```
/settings  -> SettingsPage (already exists in routes)
```

## Validation Rules

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| host | Yes | string | Non-empty, valid hostname/IP |
| port | Yes | number | 1-65535 |
| region | Yes | string | Non-empty |
| useHttps | No | boolean | - |

## Security
- No credentials stored in settings
- Only connection metadata (host, port, region)
- localStorage only accessible by same origin
- HTTPS toggle for future production use

## Migration
- On first load: check localStorage, migrate if schema changes
- Version key in storage for future migrations