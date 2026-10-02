export interface ConnectionSettings {
  host: string;
  port: number;
  region: string;
  useHttps: boolean;
}

export const DEFAULT_SETTINGS: ConnectionSettings = {
  host: 'localhost',
  port: 4566,
  region: 'us-east-1',
  useHttps: false,
};

export const SETTINGS_STORAGE_KEY = 'aws-dashboard-settings';

export function buildEndpoint(settings: ConnectionSettings): string {
  const protocol = settings.useHttps ? 'https' : 'http';
  const host = settings.host.includes(':') && !settings.host.startsWith('[')
    ? `[${settings.host}]`
    : settings.host;

  return `${protocol}://${host}:${settings.port}`;
}

export function loadSettings(): ConnectionSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SETTINGS;

    const value = parsed as Partial<ConnectionSettings>;
    return {
      host: typeof value.host === 'string' ? value.host : DEFAULT_SETTINGS.host,
      port: typeof value.port === 'number' && Number.isInteger(value.port)
        ? value.port
        : DEFAULT_SETTINGS.port,
      region: typeof value.region === 'string' ? value.region : DEFAULT_SETTINGS.region,
      useHttps: typeof value.useHttps === 'boolean' ? value.useHttps : DEFAULT_SETTINGS.useHttps,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function persistSettings(settings: ConnectionSettings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}