import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useTheme, useThemeState } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { SessionCard } from '@/components/SessionCard';

export default function SessionsScreen() {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);

  const sessions = [
    {
      id: '1',
      title: 'Shoulder + Hip + Foot',
      label: 'CURRENT MOVEMENT SESSION',
      phase: 'Week 01',
      schedule: 'Repeat 3x',
      progressPercent: 33,
      progressLabel: 'Plan 1 of 3',
      isActive: true,
    },
    {
      id: '2',
      title: 'Upper Back + Lower Back',
      label: 'MOVEMENT SESSION',
      phase: 'Week 01',
      schedule: 'Repeat 3x',
      progressPercent: 33,
      progressLabel: 'Plan 1 of 3',
      isActive: false,
    },
  ];

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

          {/* Cards List */}
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onStartPress={() => router.push('/sessions/session-details')}
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

  });
