import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';

import { useTheme, useThemeState } from '@/hooks/use-theme';
import { SessionCard } from '@/components/SessionCard';
import { RootState } from '@/redux/store';
import { useGetProgressSummaryQuery, useGetSessionsQuery } from '@/redux/api/sessionApi';

const currentWeekDates = () => {
  const now = new Date();
  const monday = new Date(now);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      key: date.toLocaleDateString('en-CA'),
      label: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
    };
  });
};

export function HomeDashboard() {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: summary, isLoading: isSummaryLoading } = useGetProgressSummaryQuery();
  const { data: sessionsData, isLoading: isSessionsLoading } = useGetSessionsQuery();

  const activeSession = summary?.active_session ?? null;
  const focusAreas = activeSession?.target_areas ?? [];
  const nextExercise = activeSession?.next_exercise ?? null;
  const weekDates = useMemo(currentWeekDates, []);
  const nextExerciseInitialIndex = useMemo(() => {
    if (!activeSession?.next_exercise) return 0;
    const plan = activeSession.plans.find(
      (item) => item.plan_id === activeSession.next_exercise?.plan_id,
    );
    if (!plan) return 0;
    const exercises = ['reset', 'control', 'integrate'].flatMap(
      (phase) => plan.phases[phase as keyof typeof plan.phases],
    );
    const index = exercises.findIndex(
      (exercise) => exercise.exercise_id === activeSession.next_exercise?.exercise_id,
    );
    return index >= 0 ? String(index) : '0';
  }, [activeSession]);

  const currentSessionCard = activeSession
    ? {
        title: activeSession.session_name,
        label: 'CURRENT MOVEMENT SESSION',
        phase: activeSession.plan_count === 1 ? '1 Plan' : `${activeSession.plan_count} Plans`,
        schedule: activeSession.schedule_days
          ? `Repeat ${activeSession.schedule_days}x`
          : `${activeSession.total_exercise_count} Exercises`,
        progressPercent: activeSession.progress_percent,
        progressLabel:
          activeSession.total_exercise_count > 0
            ? `${activeSession.completed_exercise_count} of ${activeSession.total_exercise_count} exercises`
            : 'No progress yet',
        isActive: activeSession.status === 'active',
      }
    : null;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}.
        </Text>
      </View>

      {isSummaryLoading && !summary ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={theme.secondary} />
          <Text style={styles.stateText}>Loading your movement summary…</Text>
        </View>
      ) : currentSessionCard ? (
        <SessionCard
          session={currentSessionCard}
          startButtonText="Start Current Session"
          onStartPress={() =>
            router.push({
              pathname: '/sessions/session-details',
              params: { sessionId: activeSession?.id },
            })
          }
          onCreateNewPress={() => router.push('/intake')}
        />
      ) : (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>No active session yet</Text>
          <Text style={styles.stateText}>
            Create a movement session to start tracking streaks and progress.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => router.push('/intake')}
          >
            <Text style={styles.primaryButtonText}>Create Session</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.halfCard}>
          <Text style={styles.statLabel}>WEEKLY PROGRESS</Text>
          <View style={styles.indicatorsContainer}>
            {weekDates.map((day) => {
              const isCompleted = summary?.completed_dates_this_week.includes(day.key);
              return isCompleted ? (
                <View key={day.key} style={styles.indicatorCompleted}>
                  <Feather name="check" size={10} color="#050B14" />
                </View>
              ) : (
                <View key={day.key} style={styles.indicatorEmpty} />
              );
            })}
          </View>
          <Text style={styles.statValue}>
            {summary?.weekly_completed_count ?? 0} Completed
          </Text>
          <Text style={styles.statSubtext}>
            {Math.max((summary?.weekly_target_count ?? 0) - (summary?.weekly_completed_count ?? 0), 0)} Remaining
          </Text>
        </View>

        <View style={styles.halfCard}>
          <Text style={styles.statLabel}>FOCUS AREAS</Text>
          <View style={styles.focusList}>
            {focusAreas.length ? (
              focusAreas.slice(0, 3).map((area) => (
                <View key={area} style={styles.focusItem}>
                  <View style={styles.focusBadge} />
                  <Text style={styles.focusText}>{area}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.statSubtext}>No focus areas yet</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.halfCard, styles.streakCard]}>
          <Ionicons name="flame" size={30} color="#DEB7FF" style={{ marginBottom: 6 }} />
          <Text style={[styles.statLabel, { marginBottom: 5 }]}>STREAK</Text>
          <Text style={[styles.streakValue, { marginBottom: 2 }]}>
            {summary?.current_streak_days ?? 0} Days
          </Text>
          <Text style={styles.streakSubtext}>IN A ROW</Text>
        </View>

        <View style={styles.halfCard}>
          <Text style={styles.statLabel}>PLAN GOAL</Text>
          <Text style={styles.goalTitle}>
            {activeSession?.user_case ?? 'Create a session to set a movement goal'}
          </Text>
          <View style={styles.bulletList}>
            {focusAreas.slice(0, 3).map((area) => (
              <View key={area} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: theme.secondary }]} />
                <Text style={styles.bulletItem}>{area}</Text>
              </View>
            ))}
            {!focusAreas.length && (
              <Text style={styles.bulletItem}>No active session selected yet.</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Try This Next</Text>
      </View>

      {nextExercise ? (
        <TouchableOpacity
          style={styles.supplementalCard}
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: '/sessions/exercise-tracker',
              params: {
                id: nextExercise.plan_id,
                sessionId: nextExercise.session_id,
                initialPhaseIndex: nextExerciseInitialIndex,
              },
            })
          }
        >
          <Image
            source={{ uri: nextExercise.short_clip_video?.thumbnail_url ?? nextExercise.tutorial_video?.thumbnail_url ?? 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80' }}
            style={styles.supplementalImage}
          />
          <View style={styles.supplementalContent}>
            <Text style={styles.supplementalLabel}>{nextExercise.phase.toUpperCase()}</Text>
            <Text style={styles.supplementalTitle}>{nextExercise.exercise_name}</Text>
            <View style={styles.supplementalMeta}>
              <View style={styles.metaItem}>
                <Feather name="layers" size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>{nextExercise.plan_name}</Text>
              </View>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} style={styles.chevronIcon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.stateCardCompact}>
          <Text style={styles.stateText}>No next exercise right now.</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Explore Movement Sessions</Text>
        <TouchableOpacity onPress={() => router.push('/sessions')}>
          <Text style={styles.viewAllLink}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}>
        {isSessionsLoading && !sessionsData ? (
          <View style={styles.explorePlaceholder}>
            <ActivityIndicator color={theme.secondary} />
          </View>
        ) : (
          (sessionsData?.items ?? []).map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.exploreCard}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: '/sessions/session-details',
                  params: { sessionId: session.id },
                })
              }
            >
              <View style={styles.exploreImagePlaceholder}>
                <Feather name="activity" size={22} color={theme.secondary} />
              </View>
              <Text style={styles.exploreTitle}>{session.session_name}</Text>
              <Text style={styles.exploreMeta}>
                {session.completed_exercise_count} / {session.total_exercise_count} exercises
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, themeState: ReturnType<typeof useThemeState>) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 40,
    },
    welcomeContainer: {
      marginBottom: 20,
    },
    welcomeText: {
      fontSize: 26,
      fontWeight: '700',
      color: theme.text,
    },
    stateCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
      gap: 10,
    },
    stateCardCompact: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 16,
      marginBottom: 24,
      alignItems: 'center',
    },
    stateTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },
    stateText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '600',
      textAlign: 'center',
    },
    primaryButton: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      paddingHorizontal: 18,
      paddingVertical: 12,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    halfCard: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 16,
      minHeight: 124,
    },
    streakCard: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.textSecondary,
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    indicatorsContainer: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 12,
      flexWrap: 'wrap',
    },
    indicatorCompleted: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    indicatorEmpty: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: theme.inputBorder,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
    },
    statSubtext: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    focusList: {
      gap: 8,
    },
    focusItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    focusBadge: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.secondary,
      marginRight: 8,
    },
    focusText: {
      fontSize: 13,
      color: theme.text,
      fontWeight: '500',
    },
    streakValue: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text,
    },
    streakSubtext: {
      fontSize: 10,
      fontWeight: '800',
      color: '#DEB7FF',
      letterSpacing: 0.5,
      marginTop: 2,
    },
    goalTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    bulletList: {
      gap: 4,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bulletDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      marginRight: 8,
    },
    bulletItem: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
    },
    viewAllLink: {
      color: theme.secondary,
      fontSize: 13,
      fontWeight: '700',
    },
    supplementalCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    supplementalImage: {
      width: 64,
      height: 64,
      borderRadius: 12,
      marginRight: 16,
    },
    supplementalContent: {
      flex: 1,
      justifyContent: 'center',
    },
    supplementalLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: theme.textSecondary,
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    supplementalTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 6,
    },
    supplementalMeta: {
      flexDirection: 'row',
      gap: 12,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metaText: {
      fontSize: 11,
      color: theme.textSecondary,
    },
    chevronIcon: {
      marginLeft: 8,
    },
    horizontalScrollContent: {
      paddingRight: 24,
      marginBottom: 24,
    },
    explorePlaceholder: {
      width: 120,
      height: 104,
      borderRadius: 16,
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    exploreCard: {
      width: 156,
      marginRight: 16,
    },
    exploreImagePlaceholder: {
      width: '100%',
      height: 104,
      borderRadius: 16,
      marginBottom: 8,
      backgroundColor: themeState === 'dark' ? '#111A2A' : '#EDF3FF',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    exploreTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    exploreMeta: {
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: '500',
    },
  });
