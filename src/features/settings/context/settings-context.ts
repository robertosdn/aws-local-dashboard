import { createContext } from 'react';

import type { ConnectionSettings } from '../types/settings';

export interface SettingsContextValue {
  settings: ConnectionSettings;
  endpoint: string;
  saveSettings: (settings: ConnectionSettings) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);