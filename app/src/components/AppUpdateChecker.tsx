import React, { useState } from 'react';
import { Platform } from 'react-native';
import { useGetAppVersionConfigQuery } from '@/redux/api/appConfigApi';
import { getCurrentAppVersion, isVersionOlder } from '@/utils/versionCheck';
import { UpdateModal } from './UpdateModal';

export function AppUpdateChecker() {
  const { data: config, isLoading, isError } = useGetAppVersionConfigQuery();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || isError || !config) {
    return null;
  }

  const platformConfig = Platform.OS === 'ios' ? config.ios : config.android;
  if (!platformConfig) {
    return null;
  }

  const currentVersion = getCurrentAppVersion();
  const isOlderThanLatest = isVersionOlder(currentVersion, platformConfig.latest_version);
  const isBelowMinimum = isVersionOlder(currentVersion, platformConfig.minimum_version);
  const isForceUpdate = Boolean(platformConfig.force_update || isBelowMinimum);
  const shouldPrompt = isOlderThanLatest || isBelowMinimum;

  // If update is needed and not dismissed (or if it's a mandatory force update)
  const isVisible = shouldPrompt && (!dismissed || isForceUpdate);

  if (!isVisible) {
    return null;
  }

  return (
    <UpdateModal
      visible={isVisible}
      isForceUpdate={isForceUpdate}
      title={platformConfig.title}
      message={platformConfig.message}
      url={platformConfig.url}
      currentVersion={currentVersion}
      latestVersion={platformConfig.latest_version}
      onDismiss={() => setDismissed(true)}
    />
  );
}
