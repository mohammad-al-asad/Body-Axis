import * as Application from 'expo-application';
import Constants from 'expo-constants';

/**
 * Returns true if currentVersion is strictly older than targetVersion.
 * E.g., isVersionOlder('1.0.2', '1.0.4') -> true
 *       isVersionOlder('1.0.4', '1.0.4') -> false
 *       isVersionOlder('1.1.0', '1.0.4') -> false
 */
export function isVersionOlder(currentVersion: string, targetVersion: string): boolean {
  if (!currentVersion || !targetVersion) return false;

  const clean = (v: string) => v.replace(/^[vV]/, '').split(/[-+]/)[0].trim();
  const currentParts = clean(currentVersion).split('.').map((p) => parseInt(p, 10) || 0);
  const targetParts = clean(targetVersion).split('.').map((p) => parseInt(p, 10) || 0);

  const length = Math.max(currentParts.length, targetParts.length);
  for (let i = 0; i < length; i++) {
    const c = currentParts[i] ?? 0;
    const t = targetParts[i] ?? 0;
    if (c < t) return true;
    if (c > t) return false;
  }
  return false;
}

export function getCurrentAppVersion(): string {
  return Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';
}
