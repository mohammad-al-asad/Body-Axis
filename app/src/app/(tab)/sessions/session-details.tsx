import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { PlanCard, ResetPlan, RoutineEquipment, RoutinePhase } from '@/components/PlanCard';
import { MovementSession, SessionPlan, useGetSessionQuery } from '@/redux/api/sessionApi';
import { phaseOrder } from '@/utils/phase';
import {
  cancelOfflineDownload,
  createPlanOfflineDownloadRequest,
  getOfflineDownloads,
  getSavedOfflineSession,
  planAssetDownloadIds,
  removeOfflinePlan,
  saveOfflineSession,
} from '@/services/offlineDownloads';

const EQUIPMENT_ICONS: Record<string, RoutineEquipment['icon']> = {
  'Yoga Mat': 'square',
  'Resistance Band': 'activity',
  Dumbbell: 'target',
  'Foam Roller': 'disc',
  'Lacrosse Ball': 'circle',
  'Yoga Block': 'box',
  Bench: 'trello',
  'Mini Band': 'activity',
};

export const sessionPlanToResetPlan = (
  plan: SessionPlan,
  index = 0,
): ResetPlan => {
  const phases: RoutinePhase[] = phaseOrder.flatMap((phase) =>
    plan.phases[phase].map((exercise) => ({
      phase,
      name: exercise.exercise_name,
    })),
  );
  const totalExercises = plan.total_exercise_count || phases.length;
  const completedFromExercises = phaseOrder.reduce(
    (count, phase) =>
      count + plan.phases[phase].filter((exercise) => exercise.is_completed).length,
    0,
  );
  const completedExercises = plan.completed_exercise_count ?? completedFromExercises;

  return {
    id: plan.plan_id,
    title: plan.plan_name,
    duration: plan.duration,
    isActive: index === 0,
    progressPercent: totalExercises
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0,
    progressLabel: totalExercises
      ? `${completedExercises} of ${totalExercises} exercises`
      : 'No exercises yet',
    equipment: plan.equipment_needed.map((name) => ({
      name,
      icon: EQUIPMENT_ICONS[name] ?? 'box',
    })),
    phases,
  };
};

export default function SessionDetailsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string | string[] }>();
  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;
  const {
    data: onlineSession,
    isLoading,
    isError,
    refetch,
  } = useGetSessionQuery(sessionId ?? '', { skip: !sessionId });

  const [offlineSession, setOfflineSession] = useState<MovementSession | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const session = onlineSession ?? offlineSession;

  useEffect(() => {
    if (!sessionId) return;
    let isMounted = true;

    const loadOfflineSession = async () => {
      try {
        const [savedSession, downloads] = await Promise.all([
          getSavedOfflineSession(sessionId),
          getOfflineDownloads(sessionId),
        ]);

        if (!isMounted) return;
        setOfflineSession(savedSession);
        setSavedIds(
          Array.from(
            new Set(
              downloads
                .filter((download) => download.status !== 'canceled')
                .map((download) => download.planId)
                .filter((planId): planId is string => Boolean(planId)),
            ),
          ),
        );
      } catch {
        if (isMounted) {
          setOfflineSession(null);
        }
      }
    };

    void loadOfflineSession();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const plans = useMemo(
    () =>
      session
        ? session.plans.map((plan, index) =>
            sessionPlanToResetPlan(plan, index),
          )
        : [],
    [session],
  );

  const toggleSave = async (plan: ResetPlan) => {
    const isSaved = savedIds.includes(plan.id);
    if (isSaved) {
      setSavedIds((prev) => prev.filter((id) => id !== plan.id));
      const sessionPlan = session?.plans.find(
        (item) => item.plan_id === plan.id || item.id === plan.id,
      );
      if (session && sessionPlan) {
        const downloadIds = planAssetDownloadIds(session.id, sessionPlan);
        void Promise.all([
          ...downloadIds.map((downloadId) => cancelOfflineDownload(downloadId)),
          removeOfflinePlan(session.id, sessionPlan),
        ]);
      }
      Alert.alert('Removed', `${plan.title} removed from saved list`);
      return;
    }

    const sessionPlan = session?.plans.find(
      (item) => item.plan_id === plan.id || item.id === plan.id,
    );

    if (!session || !sessionPlan) {
      setSavedIds((prev) => [...prev, plan.id]);
      Alert.alert('Saved', `${plan.title} saved locally. Videos will download when session data is available.`);
      return;
    }

    setSavingIds((prev) => [...prev, plan.id]);
    try {
      const downloads = await saveOfflineSession(
        createPlanOfflineDownloadRequest(session, sessionPlan),
      );
      const videoCount = downloads.length;
      setSavedIds((prev) => (prev.includes(plan.id) ? prev : [...prev, plan.id]));
      Alert.alert(
        'Download Started',
        videoCount
          ? `${plan.title} is being saved offline. You can leave the app while videos download.`
          : `${plan.title} metadata was saved, but no videos were attached to this plan yet.`,
      );
    } catch (error) {
      Alert.alert(
        'Could Not Save Offline',
        error instanceof Error ? error.message : 'Please try again when your connection is stable.',
      );
    } finally {
      setSavingIds((prev) => prev.filter((id) => id !== plan.id));
    }
  };

  const handleSeeDetails = (plan: ResetPlan) => {
    router.push({
      pathname: '/sessions/plan-details',
      params: {
        id: plan.id,
        ...(session?.id ? { sessionId: session.id } : {}),
      },
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Section */}
        <Header />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Back Button Container */}
            <TouchableOpacity
              style={styles.backContainer}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={16} color={theme.tertiary} style={styles.backIcon} />
              <Text style={styles.backText}>Go Back</Text>
            </TouchableOpacity>

            {/* Movement Library Header Titles */}
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>
                {session ? `All Plans for : ${session.session_name}` : 'Session details unavailable'}
              </Text>
              <Text style={styles.subtitle}>
                {session
                  ? `${session.plan_count} matching plan${session.plan_count === 1 ? '' : 's'} for ${session.target_areas.join(', ')} · ${session.user_case}`
                  : 'We could not load session-backed plans for this screen.'}
              </Text>
            </View>

            {isLoading && !session && (
              <View style={styles.stateCard}>
                <ActivityIndicator color={theme.secondary} />
                <Text style={styles.stateText}>Loading plans…</Text>
              </View>
            )}

            {isError && !isLoading && !session && (
              <View style={styles.stateCard}>
                <Text style={styles.stateText}>Could not load this session.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {!isLoading && !isError && plans.length === 0 && (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>No matching plans yet</Text>
                <Text style={styles.stateText}>
                  No published admin plan matches this target area and user case.
                </Text>
              </View>
            )}

            {(!isLoading || session) && (!isError || session) && plans.map((plan) => {
              const isSaved = savedIds.includes(plan.id);
              const isSaving = savingIds.includes(plan.id);
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isSaved={isSaved}
                  saveLabel={isSaving ? 'Saving...' : undefined}
                  onToggleSave={() => toggleSave(plan)}
                  onSeeDetails={() => handleSeeDetails(plan)}
                />
              );
            })}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
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
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 40,
    },
    backContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 16,
    },
    backIcon: {
      marginRight: 8,
    },
    backText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.tertiary,
    },
    titleContainer: {
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    mainTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'left',
      marginBottom: 10,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'left',
      lineHeight: 20,
    },
    stateCard: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      gap: 12,
    },
    stateTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
    },
    stateText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 20,
    },
    retryButton: {
      borderWidth: 1,
      borderColor: theme.secondary,
      borderRadius: 12,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    retryButtonText: {
      color: theme.secondary,
      fontWeight: '800',
    },
  });
