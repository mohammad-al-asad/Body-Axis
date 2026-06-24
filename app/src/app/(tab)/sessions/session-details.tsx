import React, { useMemo, useState } from 'react';
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
import { SessionPlan, useGetSessionQuery } from '@/redux/api/sessionApi';

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

const phaseOrder = ['reset', 'control', 'integrate'] as const;

export const sessionPlanToResetPlan = (
  plan: SessionPlan,
  index = 0,
  total = 1,
): ResetPlan => {
  const phases: RoutinePhase[] = phaseOrder.flatMap((phase) =>
    plan.phases[phase].map((exercise) => ({
      phase,
      name: exercise.exercise_name,
    })),
  );

  return {
    id: plan.plan_id,
    title: plan.plan_name,
    duration: plan.duration,
    isActive: index === 0,
    progressPercent: total ? Math.round(((index + 1) / total) * 100) : 0,
    progressLabel: total ? `Plan ${index + 1} of ${total}` : 'Plan 1 of 1',
    equipment: plan.equipment_needed.map((name) => ({
      name,
      icon: EQUIPMENT_ICONS[name] ?? 'box',
    })),
    phases,
  };
};

export const PLANS: ResetPlan[] = [
  {
    id: '1',
    title: 'Hip Mobility',
    duration: '~15 Mins',
    isActive: true,
    progressPercent: 33,
    progressLabel: 'Plan 1 of 3',
    equipment: [
      { icon: 'square', name: 'Yoga Mat' },
      { icon: 'activity', name: 'Resistance Band' },
      { icon: 'activity', name: 'Mini Band' },
      { icon: 'target', name: 'Dumbbell' },
      { icon: 'disc', name: 'Foam Roller' },
      { icon: 'circle', name: 'Lacrosse Ball' },
      { icon: 'box', name: 'Yoga Block' },
      { icon: 'trello', name: 'Bench' },
    ],
    phases: [
      { phase: 'RESET', name: 'Side-Lying Thoracic Rotation (Open Book)' },
      { phase: 'CONTROL', name: 'Prone Trap Raise' },
      { phase: 'INTEGRATE', name: 'Side-Lying Shoulder External Rotation' },
    ],
  },
  {
    id: '2',
    title: 'Shoulder Impingement',
    duration: '~15 Mins',
    isActive: false,
    progressPercent: 33,
    progressLabel: 'Plan 1 of 3',
    equipment: [
      { icon: 'square', name: 'Yoga Mat' },
      { icon: 'activity', name: 'Resistance Band' },
      { icon: 'disc', name: 'Foam Roller' },
    ],
    phases: [
      { phase: 'RESET', name: 'Suboccipital Release + Chin Nod' },
      { phase: 'CONTROL', name: 'Serratus Wall Slide' },
      { phase: 'INTEGRATE', name: 'Side-Lying Low Trap Raise' },
    ],
  },
  {
    id: '3',
    title: 'Ankle Stability',
    duration: '~15 Mins',
    isActive: false,
    progressPercent: 33,
    progressLabel: 'Plan 1 of 3',
    equipment: [
      { icon: 'square', name: 'Yoga Mat' },
      { icon: 'activity', name: 'Resistance Band' },
    ],
    phases: [
      { phase: 'RESET', name: 'Short Foot Activation Hold' },
      { phase: 'CONTROL', name: 'Standing Soleus Knee Bend Hold' },
      { phase: 'INTEGRATE', name: 'Single-Leg RNT Squat' },
    ],
  },
  {
    id: '4',
    title: 'Full Body Alignment',
    duration: '~30 Mins',
    isActive: false,
    progressPercent: 33,
    progressLabel: 'Plan 1 of 3',
    equipment: [
      { icon: 'square', name: 'Yoga Mat' },
      { icon: 'activity', name: 'Resistance Band' },
      { icon: 'activity', name: 'Mini Band' },
      { icon: 'target', name: 'Dumbbell' },
      { icon: 'disc', name: 'Foam Roller' },
      { icon: 'circle', name: 'Lacrosse Ball' },
      { icon: 'box', name: 'Yoga Block' },
      { icon: 'trello', name: 'Bench' },
    ],
    phases: [
      { phase: 'RESET', name: 'Full Body Foam Roll & Lacrosse Release' },
      { phase: 'CONTROL', name: 'Banded Dumbbell Bench Press' },
      { phase: 'INTEGRATE', name: 'Yoga Block Squat Calibration' },
    ],
  },
];

// Compatibility exports
export const ROUTINES = PLANS;

export default function SessionDetailsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string | string[] }>();
  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;
  const {
    data: session,
    isLoading,
    isError,
    refetch,
  } = useGetSessionQuery(sessionId ?? '', { skip: !sessionId });

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const plans = useMemo(
    () =>
      session
        ? session.plans.map((plan, index) =>
            sessionPlanToResetPlan(plan, index, session.plans.length),
          )
        : PLANS,
    [session],
  );

  const toggleSave = (plan: ResetPlan) => {
    const isSaved = savedIds.includes(plan.id);
    if (isSaved) {
      setSavedIds((prev) => prev.filter((id) => id !== plan.id));
      Alert.alert('Removed', `${plan.title} removed from saved list`);
    } else {
      setSavedIds((prev) => [...prev, plan.id]);
      Alert.alert('Saved', `${plan.title} saved successfully!`);
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
                {session?.session_name || 'Hip Mobility + Core Stability'}
              </Text>
              <Text style={styles.subtitle}>
                {session
                  ? `${session.plan_count} matching plan${session.plan_count === 1 ? '' : 's'} for ${session.target_areas.join(', ')} · ${session.user_case}`
                  : 'Based on your selections, here are your personalized movement plans to choose from.'}
              </Text>
            </View>

            {isLoading && (
              <View style={styles.stateCard}>
                <ActivityIndicator color={theme.secondary} />
                <Text style={styles.stateText}>Loading plans…</Text>
              </View>
            )}

            {isError && !isLoading && (
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

            {!isLoading && !isError && plans.map((plan) => {
              const isSaved = savedIds.includes(plan.id);
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isSaved={isSaved}
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
