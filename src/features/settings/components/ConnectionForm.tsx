import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ConnectionSettings } from '../types/settings';
import { buildEndpoint } from '../types/settings';

type DraftSettings = {
  host: string;
  port: string;
  region: string;
  useHttps: boolean;
};

type FieldErrors = Partial<Record<'host' | 'port' | 'region', string>>;

interface ConnectionFormProps {
  settings: ConnectionSettings;
  saving: boolean;
  testStatus: 'idle' | 'pending' | 'success' | 'error';
  testError?: string;
  onSave: (settings: ConnectionSettings) => Promise<void>;
  onTest: (settings: ConnectionSettings) => Promise<void>;
  onReset: () => Promise<void>;
}

function toDraft(settings: ConnectionSettings): DraftSettings {
  return { ...settings, port: String(settings.port) };
}

function validateDraft(draft: DraftSettings): {
  settings?: ConnectionSettings;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};
  const host = draft.host.trim();
  const region = draft.region.trim();
  const port = Number(draft.port);

  if (!host) {
    errors.host = 'Host is required.';
  } else {
    try {
      const urlHost = host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;
      const parsed = new URL(`http://${urlHost}`);
      if (!parsed.hostname || parsed.port || parsed.pathname !== '/') {
        errors.host = 'Enter a hostname or IP address without a protocol or port.';
      }
    } catch {
      errors.host = 'Enter a valid hostname or IP address.';
    }
  }

  if (!/^\d+$/.test(draft.port) || !Number.isInteger(port) || port < 1 || port > 65535) {
    errors.port = 'Port must be a whole number between 1 and 65535.';
  }

  if (!region) errors.region = 'Region is required.';

  if (Object.keys(errors).length > 0) return { errors };

  return {
    errors,
    settings: { host, port, region, useHttps: draft.useHttps },
  };
}

export function ConnectionForm({
  settings,
  saving,
  testStatus,
  testError,
  onSave,
  onTest,
  onReset,
}: ConnectionFormProps) {
  const [draft, setDraft] = useState(() => toDraft(settings));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setDraft(toDraft(settings));
    setErrors({});
  }, [settings]);

  const validate = () => {
    const result = validateDraft(draft);
    setErrors(result.errors);
    return result.settings;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validSettings = validate();
    if (validSettings) await onSave(validSettings);
  };

  const handleTest = async () => {
    const validSettings = validate();
    if (validSettings) await onTest(validSettings);
  };

  const handleCancel = () => {
    setDraft(toDraft(settings));
    setErrors({});
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await onReset();
    } finally {
      setResetting(false);
    }
  };

  const setField = <K extends keyof DraftSettings>(key: K, value: DraftSettings[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const preview = (() => {
    const result = validateDraft(draft);
    return result.settings ? buildEndpoint(result.settings) : null;
  })();

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Connection</h3>
        <p className="mt-1 text-sm text-slate-400">
          Configure the endpoint used by the dashboard to reach your AWS-compatible emulator.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="connection-host" className="text-slate-200">
            Host
          </Label>
          <Input
            id="connection-host"
            name="host"
            value={draft.host}
            onChange={(event) => setField('host', event.target.value)}
            aria-invalid={Boolean(errors.host)}
            aria-describedby={errors.host ? 'connection-host-error' : undefined}
            autoComplete="url"
          />
          {errors.host && (
            <p id="connection-host-error" role="alert" className="text-sm text-red-400">
              {errors.host}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="connection-port" className="text-slate-200">
            Port
          </Label>
          <Input
            id="connection-port"
            name="port"
            type="number"
            min="1"
            max="65535"
            step="1"
            value={draft.port}
            onChange={(event) => setField('port', event.target.value)}
            aria-invalid={Boolean(errors.port)}
            aria-describedby={errors.port ? 'connection-port-error' : undefined}
            inputMode="numeric"
          />
          {errors.port && (
            <p id="connection-port-error" role="alert" className="text-sm text-red-400">
              {errors.port}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="connection-region" className="text-slate-200">
            Region
          </Label>
          <Input
            id="connection-region"
            name="region"
            value={draft.region}
            onChange={(event) => setField('region', event.target.value)}
            aria-invalid={Boolean(errors.region)}
            aria-describedby={errors.region ? 'connection-region-error' : undefined}
            autoComplete="off"
          />
          {errors.region && (
            <p id="connection-region-error" role="alert" className="text-sm text-red-400">
              {errors.region}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 self-end pb-2">
          <input
            id="connection-https"
            name="useHttps"
            type="checkbox"
            checked={draft.useHttps}
            onChange={(event) => setField('useHttps', event.target.checked)}
            className="h-4 w-4 accent-cyan-500"
          />
          <label htmlFor="connection-https" className="text-sm font-medium text-slate-200">
            Use HTTPS
          </label>
        </div>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2">
        <p className="text-xs uppercase text-slate-500">Effective endpoint</p>
        <p className="mt-1 break-all font-mono text-sm text-slate-200">
          {preview ?? 'Complete valid settings to preview endpoint'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving || resetting}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={saving || resetting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleTest}
          disabled={testStatus === 'pending' || saving || resetting}
        >
          {testStatus === 'pending' ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset} disabled={saving || resetting}>
          {resetting ? 'Resetting...' : 'Reset to Defaults'}
        </Button>
      </div>

      {testStatus === 'success' && (
        <p role="status" className="text-sm text-emerald-300">
          Connection test succeeded.
        </p>
      )}
      {testStatus === 'error' && (
        <p role="alert" className="text-sm text-red-300">
          {testError || 'Connection test failed.'}
        </p>
      )}
    </form>
  );
}
