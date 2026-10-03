import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useEndpointStatus } from '@/lib/useEndpointStatus';
import { ConnectionForm } from './ConnectionForm';
import { ConnectionStatus } from './ConnectionStatus';
import { useConnectionTest } from '../hooks/useConnectionTest';
import { useSettings } from '../hooks/useSettings';
import { buildEndpoint, type ConnectionSettings } from '../types/settings';

export function SettingsPage() {
  const { settings, endpoint, saveSettings, resetToDefaults } = useSettings();
  const { isOnline, isChecking } = useEndpointStatus(endpoint);
  const connectionTest = useConnectionTest();
  const [saving, setSaving] = useState(false);
  const [lastTestedAt, setLastTestedAt] = useState<Date | null>(null);

  const handleSave = async (nextSettings: ConnectionSettings) => {
    setSaving(true);
    try {
      await saveSettings(nextSettings);
      toast({
        title: 'Settings saved',
        description: 'The dashboard is now using the saved endpoint.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        description:
          error instanceof Error ? error.message : 'Unable to write settings to browser storage.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (testSettings: ConnectionSettings) => {
    try {
      await connectionTest.test({
        endpoint: buildEndpoint(testSettings),
        region: testSettings.region,
      });
      toast({
        title: 'Connection successful',
        description: 'The endpoint responded to an SQS request.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Connection failed',
        description:
          error instanceof Error ? error.message : 'Could not reach the configured endpoint.',
        variant: 'destructive',
      });
    } finally {
      setLastTestedAt(new Date());
    }
  };

  const handleReset = async () => {
    try {
      await resetToDefaults();
      connectionTest.reset();
      setLastTestedAt(null);
      toast({
        title: 'Defaults restored',
        description: 'The default local endpoint is active.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Failed to reset settings',
        description:
          error instanceof Error ? error.message : 'Unable to write settings to browser storage.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
          Configuration
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Settings</h2>
        <p className="mt-2 text-sm text-slate-300">
          Manage the emulator endpoint used by dashboard features.
        </p>
      </header>

      <ConnectionStatus
        endpoint={endpoint}
        isOnline={isOnline}
        isChecking={isChecking}
        lastTestedAt={lastTestedAt}
      />

      <Card>
        <CardContent className="p-5">
          <ConnectionForm
            settings={settings}
            saving={saving}
            testStatus={connectionTest.status}
            testError={
              connectionTest.error instanceof Error ? connectionTest.error.message : undefined
            }
            onSave={handleSave}
            onTest={handleTest}
            onReset={handleReset}
          />
        </CardContent>
      </Card>
    </div>
  );
}
