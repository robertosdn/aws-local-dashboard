import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { SettingsContext } from './settings-context';
import {
  buildEndpoint,
  DEFAULT_SETTINGS,
  loadSettings,
  persistSettings,
  type ConnectionSettings,
} from '../types/settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(loadSettings);
  const queryClient = useQueryClient();
  const endpoint = buildEndpoint(settings);

  const saveSettings = async (nextSettings: ConnectionSettings) => {
    persistSettings(nextSettings);
    setSettings(nextSettings);
    await queryClient.invalidateQueries({ queryKey: ['sqs'] });
  };

  const resetToDefaults = () => saveSettings(DEFAULT_SETTINGS);

  return (
    <SettingsContext.Provider value={{ settings, endpoint, saveSettings, resetToDefaults }}>
      {children}
    </SettingsContext.Provider>
  );
}
