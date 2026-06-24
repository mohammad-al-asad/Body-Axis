import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme, useThemeState } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { SessionCard } from '@/components/SessionCard';
import { MovementSession, useGetSessionsQuery } from '@/redux/api/sessionApi';

const formatSessionCard = (session: MovementSession, index: number) => {
  const planCount = session.plan_count;
  const exerciseCount = session.exercise_count;
  const progressPercent = planCount > 0 ? Math.round((1 / planCount) * 100) : 0;

  return {
    id: session.id,
    title: session.session_name,
    label: index === 0 ? 'CURRENT MOVEMENT SESSION' : 'MOVEMENT SESSION',
    phase: planCount === 1 ? '1 Plan' : `${planCount} Plans`,
    schedule: session.schedule_days
      ? `Repeat ${session.schedule_days}x`
      : `${exerciseCount} Exercises`,
    progressPercent,
    progressLabel: planCount ? `Plan 1 of ${planCount}` : 'No matching plans yet',
    isActive: index === 0 && session.status === 'active',
  };
};

export default function SessionsScreen() {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);
  const { data, isLoading, isError, refetch } = useGetSessionsQuery();
  const sessions = data?.items ?? [];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Component */}
        <Header showNotification={true} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* Screen Header */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>My Movement Sessions</Text>
            <Text style={styles.subtitleText}>Manage reminders and wellness alerts</Text>
          </View>

          {isLoading && (
            <View style={styles.stateCard}>
              <ActivityIndicator color={theme.secondary} />
              <Text style={styles.stateText}>Loading your sessions…</Text>
            </View>
          )}

          {isError && !isLoading && (
            <View style={styles.stateCard}>
              <Text style={styles.stateText}>Could not load sessions.</Text>
              <TouchableOpacity onPress={refetch} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoading && !isError && sessions.length === 0 && (
            <View style={styles.stateCard}>
              <Text style={styles.emptyTitle}>No movement sessions yet</Text>
              <Text style={styles.stateText}>
                Create one from your target area and movement goal.
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                activeOpacity={0.8}
                onPress={() => router.push('/intake')}
              >
                <Text style={styles.createButtonText}>Create Session</Text>
              </TouchableOpacity>
            </View>
          )}

          {sessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={formatSessionCard(session, index)}
              onStartPress={() =>
                router.push({
                  pathname: '/sessions/session-details',
                  params: { sessionId: session.id },
                })
              }
              onCreateNewPress={index === 0 ? () => router.push('/intake') : undefined}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, themeState: ReturnType<typeof useThemeState>) =>
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
      paddingTop: 16,
      paddingBottom: 40,
    },
    backContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 24,
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
      marginBottom: 28,
    },
    titleText: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 6,
    },
    subtitleText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    stateCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 24,
      alignItems: 'center',
      gap: 12,
    },
    emptyTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
    },
    stateText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
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
    createButton: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      paddingHorizontal: 22,
      paddingVertical: 12,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontWeight: '800',
    },

  });
