import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useTheme, useThemeState } from '@/hooks/use-theme';
import { Header } from '@/components/Header';

export default function SessionsScreen() {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);

  const sessions = [
    {
      id: '1',
      title: 'Shoulder + Hip + Foot',
      label: 'CURRENT MOVEMENT PLAN',
      phase: 'Week 01',
      schedule: 'Repeat 3x',
      progressPercent: 33,
      progressLabel: 'Plan 1 of 3',
      isActive: true,
    },
    {
      id: '2',
      title: 'Upper Back + Lower Back',
      label: 'MOVEMENT PLAN',
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
          {sessions.map((session) => {
            const cardBorderColor = session.isActive
              ? (themeState === 'dark' ? theme.cardBorder : theme.secondary)
              : (themeState === 'dark' ? theme.inputBorder : '#E0E1E6');

            return (
              <View
                key={session.id}
                style={[
                  styles.sessionCard,
                  { borderColor: cardBorderColor }
                ]}
              >
                {/* Card Top Row */}
                <View style={styles.cardHeader}>
                  <Feather name="edit-2" size={18} color={theme.secondary} />
                  {session.isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                  )}
                </View>

                {/* Plan Label */}
                <Text style={styles.planLabel}>{session.label}</Text>

                {/* Plan Title */}
                <Text style={styles.planTitle}>{session.title}</Text>

                {/* Info Grid (Phase & Schedule) */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoLabel}>PHASE</Text>
                    <Text style={styles.infoValue}>{session.phase}</Text>
                  </View>
                  <View style={styles.infoColumn}>
                    <Text style={styles.infoLabel}>SCHEDULE</Text>
                    <Text style={styles.infoValue}>{session.schedule}</Text>
                  </View>
                </View>

                {/* Progress Text Row */}
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressLeftText}>{session.progressLabel}</Text>
                  <Text style={styles.progressRightText}>{session.progressPercent}%</Text>
                </View>

                {/* Progress Bar Track */}
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${session.progressPercent}%` },
                    ]}
                  />
                </View>

                {/* Start Session Button */}
                <TouchableOpacity style={styles.startButton} activeOpacity={0.8} onPress={()=>router.push("/sessions/session-details")}>
                  <Feather name="play" size={14} color="#FFFFFF" style={styles.playIcon} />
                  <Text style={styles.startButtonText}>Start This Session</Text>
                </TouchableOpacity>
              </View>
            );
          })}
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
    sessionCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      borderWidth: 1,
      padding: 24,
      marginBottom: 20,
      elevation: 2,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    activeBadge: {
      backgroundColor: 'rgba(93, 230, 255, 0.1)',
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: 'rgba(93, 230, 255, 0.25)',
    },
    activeBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 0.5,
    },
    planLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.secondary,
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    planTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 20,
    },
    infoGrid: {
      flexDirection: 'row',
      marginBottom: 24,
      gap: 32,
    },
    infoColumn: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: theme.textSecondary,
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    progressTextRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressLeftText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    progressRightText: {
      fontSize: 12,
      color: theme.secondary,
      fontWeight: '700',
    },
    progressBarTrack: {
      height: 6,
      backgroundColor: themeState === 'dark' ? '#141E30' : '#E0E1E6',
      borderRadius: 3,
      width: '100%',
      overflow: 'hidden',
      marginBottom: 24,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.secondary,
      borderRadius: 3,
    },
    startButton: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      height: 54,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    playIcon: {
      marginRight: 8,
    },
    startButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
  });
