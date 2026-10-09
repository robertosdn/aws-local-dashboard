export function formatSize(size?: number): string {
  if (size === undefined || !Number.isFinite(size) || size < 0) return '-';
  if (size < 1024) return `${size} B`;

  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = size;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex += 1;
  } while (value >= 1024 && unitIndex < units.length - 1);

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
