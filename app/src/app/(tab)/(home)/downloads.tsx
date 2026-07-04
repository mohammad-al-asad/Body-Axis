import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { useTheme } from '@/hooks/use-theme';
import {
  addOfflineDownloadListener,
  cancelOfflineDownload,
  getOfflineDownloads,
  getSavedOfflineSessions,
  OfflineDownload,
  pauseOfflineDownload,
  removeOfflinePlan,
  resumeOfflineDownload,
} from '@/services/offlineDownloads';
import { MovementSession, SessionPlan } from '@/redux/api/sessionApi';

type DownloadGroupStatus = 'processing' | 'paused' | 'completed' | 'failed';

type DownloadGroup = {
  id: string;
  sessionId: string;
  planId?: string | null;
  title: string;
  subtitle: string;
  status: DownloadGroupStatus;
  progress: number;
  completedCount: number;
  totalCount: number;
  updatedAt: number;
  session?: MovementSession;
  plan?: SessionPlan;
  downloads: OfflineDownload[];
};

const downloadEventNames = [
  'downloadProgress',
  'downloadCompleted',
  'downloadFailed',
  'downloadPaused',
  'downloadResumed',
  'downloadCanceled',
] as const;

export default function HomeDownloadsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);
  const [downloads, setDownloads] = useState<OfflineDownload[]>([]);
  const [sessions, setSessions] = useState<MovementSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);

  const loadDownloads = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [downloadRows, savedSessions] = await Promise.all([
        getOfflineDownloads(),
        getSavedOfflineSessions(),
      ]);
      setDownloads(downloadRows.filter((download) => download.status !== 'canceled'));
      setSessions(savedSessions);
    } catch {
      Alert.alert('Downloads Unavailable', 'We could not load your offline download activity right now.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDownloads();
  }, [loadDownloads]);

  useEffect(() => {
    const subscriptions = downloadEventNames.map((eventName) =>
      addOfflineDownloadListener(eventName, (payload) => {
        setDownloads((current) => {
          if (payload.status === 'canceled') {
            return current.filter((download) => download.id !== payload.id);
          }

          const existingIndex = current.findIndex((download) => download.id === payload.id);
          if (existingIndex === -1) {
            return [...current, payload];
          }

          const next = [...current];
          next[existingIndex] = payload;
          return next;
        });
      }),
    );

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, []);

  const groupedDownloads = useMemo(
    () => groupDownloads(downloads, sessions),
    [downloads, sessions],
  );

  const summary = useMemo(() => ({
    processing: groupedDownloads.filter((group) => group.status === 'processing').length,
    paused: groupedDownloads.filter((group) => group.status === 'paused').length,
    completed: groupedDownloads.filter((group) => group.status === 'completed').length,
  }), [groupedDownloads]);

  const runGroupAction = async (
    group: DownloadGroup,
    targets: OfflineDownload[],
    action: (downloadId: string) => Promise<boolean>,
    errorTitle: string,
    onSuccess?: () => void | Promise<void>,
  ) => {
    if (targets.length === 0) return;

    setBusyGroupId(group.id);
    try {
      await Promise.all(targets.map((download) => action(download.id)));
      await onSuccess?.();
    } catch {
      Alert.alert(errorTitle, 'Please try again in a moment.');
    } finally {
      setBusyGroupId(null);
    }
  };

  const handleRemoveGroup = (group: DownloadGroup) => {
    Alert.alert('Remove Download', `Remove ${group.title} from offline downloads?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void runGroupAction(
            group,
            group.downloads,
            cancelOfflineDownload,
            'Could Not Remove',
            async () => {
              if (group.session && group.plan) {
                await removeOfflinePlan(group.session.id, group.plan);
              }
              setDownloads((current) =>
                current.filter((download) => !group.downloads.some((item) => item.id === download.id)),
              );
            },
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header onBackPress={() => router.back()} showNotification={false} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              tintColor={theme.secondary}
              onRefresh={() => loadDownloads(true)}
            />
          }
        >
          <Text style={styles.title}>Downloads</Text>
          <Text style={styles.subtitle}>Offline plan download activity</Text>

          <View style={styles.summaryRow}>
            <SummaryPill label="Processing" value={summary.processing} color={theme.secondary} />
            <SummaryPill label="Paused" value={summary.paused} color={theme.warning} />
            <SummaryPill label="Done" value={summary.completed} color={theme.quaternary} />
          </View>

          <Text style={styles.sectionHeader}>DOWNLOADS</Text>

          {isLoading ? (
            <View style={styles.emptyCard}>
              <ActivityIndicator color={theme.secondary} />
              <Text style={styles.emptyTitle}>Loading downloads</Text>
            </View>
          ) : groupedDownloads.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Feather name="download-cloud" size={20} color={theme.secondary} />
              </View>
              <Text style={styles.emptyTitle}>No active downloads</Text>
              <Text style={styles.emptyText}>Saved plans from session details will show here while they process.</Text>
            </View>
          ) : (
            groupedDownloads.map((group) => (
              <DownloadCard
                key={group.id}
                group={group}
                busy={busyGroupId === group.id}
                onPause={() =>
                  runGroupAction(
                    group,
                    group.downloads.filter((download) => download.status === 'queued' || download.status === 'downloading'),
                    pauseOfflineDownload,
                    'Could Not Pause',
                  )
                }
                onResume={() =>
                  runGroupAction(
                    group,
                    group.downloads.filter((download) => download.status === 'paused' || download.status === 'failed'),
                    resumeOfflineDownload,
                    'Could Not Resume',
                  )
                }
                onRemove={() => handleRemoveGroup(group)}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SummaryPill({ label, value, color }: { label: string; value: number; color: string }) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.summaryPill}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function DownloadCard({
  group,
  busy,
  onPause,
  onResume,
  onRemove,
}: {
  group: DownloadGroup;
  busy: boolean;
  onPause: () => void;
  onResume: () => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const canPause = group.status === 'processing';
  const canResume = group.status === 'paused' || group.status === 'failed';
  const statusColor = statusToColor(group.status, theme);

  return (
    <View style={styles.downloadCard}>
      <View style={styles.downloadHeader}>
        <View style={[styles.downloadIconBox, { borderColor: statusColor }]}>
          <Feather name={statusToIcon(group.status)} size={18} color={statusColor} />
        </View>
        <View style={styles.downloadTitleWrap}>
          <Text style={styles.downloadTitle} numberOfLines={1}>{group.title}</Text>
          <Text style={styles.downloadSubtitle} numberOfLines={1}>{group.subtitle}</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusToLabel(group.status)}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${group.progress}%`, backgroundColor: statusColor }]} />
      </View>

      <View style={styles.downloadMetaRow}>
        <Text style={styles.downloadMeta}>{Math.round(group.progress)}% complete</Text>
        <Text style={styles.downloadMeta}>
          {group.completedCount}/{group.totalCount} videos
        </Text>
      </View>

      <View style={styles.actionRow}>
        {canPause && (
          <TouchableOpacity style={styles.actionButton} onPress={onPause} disabled={busy} activeOpacity={0.8}>
            <Feather name="pause" size={15} color={theme.text} />
            <Text style={styles.actionText}>{busy ? 'Pausing' : 'Pause'}</Text>
          </TouchableOpacity>
        )}
        {canResume && (
          <TouchableOpacity style={styles.actionButton} onPress={onResume} disabled={busy} activeOpacity={0.8}>
            <Feather name="play" size={15} color={theme.text} />
            <Text style={styles.actionText}>{busy ? 'Resuming' : 'Resume'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionButton, styles.removeButton]} onPress={onRemove} disabled={busy} activeOpacity={0.8}>
          <Feather name="trash-2" size={15} color={theme.error} />
          <Text style={[styles.actionText, { color: theme.error }]}>{busy ? 'Removing' : 'Remove'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function groupDownloads(downloads: OfflineDownload[], sessions: MovementSession[]): DownloadGroup[] {
  const sessionMap = new Map(sessions.map((session) => [session.id, session]));
  const grouped = downloads
    .filter((download) => download.status !== 'canceled')
    .reduce<Map<string, OfflineDownload[]>>((result, download) => {
      const key = `${download.sessionId}:${download.planId ?? 'session'}`;
      const current = result.get(key) ?? [];
      current.push(download);
      result.set(key, current);
      return result;
    }, new Map());

  return Array.from(grouped.entries())
    .map(([id, rows]) => {
      const sessionId = rows[0]?.sessionId ?? '';
      const planId = rows[0]?.planId;
      const session = sessionMap.get(sessionId);
      const plan = session?.plans.find((item) => item.plan_id === planId || item.id === planId);
      const completedCount = rows.filter((download) => download.status === 'completed').length;
      const totalCount = rows.length;
      const totalBytes = rows.reduce((sum, download) => sum + Math.max(0, download.totalBytes), 0);
      const bytesDownloaded = rows.reduce((sum, download) => sum + Math.max(0, download.bytesDownloaded), 0);
      const averageProgress = rows.reduce((sum, download) => sum + download.progress, 0) / Math.max(totalCount, 1);
      const progress = totalBytes > 0
        ? Math.min(100, Math.max(0, (bytesDownloaded / totalBytes) * 100))
        : Math.min(100, Math.max(0, averageProgress));
      const status = resolveGroupStatus(rows);

      return {
        id,
        sessionId,
        planId,
        title: plan?.plan_name ?? rows[0]?.title ?? 'Offline plan',
        subtitle: [
          session?.session_name ?? 'Saved session',
          `${totalCount} video${totalCount === 1 ? '' : 's'}`,
        ].join(' · '),
        status,
        progress: status === 'completed' ? 100 : progress,
        completedCount,
        totalCount,
        updatedAt: Math.max(...rows.map((download) => download.updatedAt)),
        session,
        plan,
        downloads: rows,
      };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

function resolveGroupStatus(downloads: OfflineDownload[]): DownloadGroupStatus {
  if (downloads.some((download) => download.status === 'downloading' || download.status === 'queued')) {
    return 'processing';
  }
  if (downloads.every((download) => download.status === 'completed')) {
    return 'completed';
  }
  if (downloads.some((download) => download.status === 'failed')) {
    return 'failed';
  }
  return 'paused';
}

function statusToLabel(status: DownloadGroupStatus) {
  switch (status) {
    case 'processing':
      return 'Processing';
    case 'paused':
      return 'Paused';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
  }
}

function statusToIcon(status: DownloadGroupStatus): keyof typeof Feather.glyphMap {
  switch (status) {
    case 'processing':
      return 'download-cloud';
    case 'paused':
      return 'pause-circle';
    case 'completed':
      return 'check-circle';
    case 'failed':
      return 'alert-circle';
  }
}

function statusToColor(status: DownloadGroupStatus, theme: ReturnType<typeof useTheme>) {
  switch (status) {
    case 'processing':
      return theme.secondary;
    case 'paused':
      return theme.warning;
    case 'completed':
      return theme.quaternary;
    case 'failed':
      return theme.error;
  }
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.text,
      marginTop: 12,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 20,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 8,
    },
    summaryPill: {
      flex: 1,
      minHeight: 70,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      backgroundColor: theme.cardBackground,
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    summaryValue: {
      fontSize: 22,
      fontWeight: '900',
    },
    summaryLabel: {
      marginTop: 2,
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: '700',
    },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.textSecondary,
      letterSpacing: 1,
      marginTop: 18,
      marginBottom: 12,
    },
    emptyCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      padding: 22,
      alignItems: 'center',
      marginBottom: 4,
    },
    emptyIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: 'rgba(93, 230, 255, 0.08)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    emptyTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '800',
      marginTop: 8,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      textAlign: 'center',
      marginTop: 6,
    },
    downloadCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      elevation: 1,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    downloadHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    downloadIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: 1,
    },
    downloadTitleWrap: {
      flex: 1,
      minWidth: 0,
    },
    downloadTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '800',
    },
    downloadSubtitle: {
      color: theme.textSecondary,
      fontSize: 12,
      marginTop: 3,
    },
    statusBadge: {
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 5,
      marginLeft: 10,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    progressTrack: {
      height: 7,
      borderRadius: 4,
      overflow: 'hidden',
      backgroundColor: theme.inputBackground,
      marginTop: 16,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    downloadMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    downloadMeta: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    actionRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },
    actionButton: {
      minHeight: 40,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      backgroundColor: theme.inputBackground,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
      gap: 7,
    },
    removeButton: {
      marginLeft: 'auto',
    },
    actionText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '800',
    },
  });
