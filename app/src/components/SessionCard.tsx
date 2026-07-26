import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, useThemeState } from '@/hooks/use-theme';

export interface SessionData {
  id?: string;
  title: string;
  label: string;
  phase: string;
  schedule: string;
  progressPercent: number;
  progressLabel: string;
  isActive?: boolean;
}

export interface SessionCardProps {
  session: SessionData;
  onStartPress: () => void;
  onCreateNewPress?: () => void;
  onDeletePress?: () => void;
  startButtonText?: string;
  isDeleting?: boolean;
}

export function SessionCard({
  session,
  onStartPress,
  onCreateNewPress,
  onDeletePress,
  startButtonText = 'Start This Session',
  isDeleting = false,
}: SessionCardProps) {
  const theme = useTheme();
  const themeState = useThemeState();
  const styles = createStyles(theme, themeState);

  const cardBorderColor = session.isActive
    ? (themeState === 'dark' ? theme.cardBorder : theme.secondary)
    : (themeState === 'dark' ? theme.inputBorder : '#E0E1E6');

  return (
    <View style={[styles.sessionCard, { borderColor: cardBorderColor }]}>
      {/* Plan Label */}
      <Text style={styles.planLabel}>{session.label}</Text>

      {/* Title & Active Badge Row */}
      <View style={styles.titleRow}>
        <Text style={styles.planTitle}>{session.title}</Text>
        <View style={styles.titleActions}>
          {session.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
          )}
          {onDeletePress && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Delete ${session.title} session`}
              disabled={isDeleting}
              onPress={onDeletePress}
              style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
              activeOpacity={0.7}
            >
              <Feather name="trash-2" size={18} color={theme.warning} />
            </TouchableOpacity>
          )}
        </View>
      </View>

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
      <TouchableOpacity
        style={[styles.startButton, { marginBottom: onCreateNewPress ? 16 : 0 }]}
        activeOpacity={0.8}
        onPress={onStartPress}
      >
        <Feather name="play" size={14} color="#FFFFFF" style={styles.playIcon} />
        <Text style={styles.startButtonText}>{startButtonText}</Text>
      </TouchableOpacity>

      {/* Start New Plan Link */}
      {onCreateNewPress && (
        <TouchableOpacity
          onPress={onCreateNewPress}
          style={styles.startNewPlanLink}
          activeOpacity={0.7}
        >
          <Text style={styles.startNewPlanLinkText}>+ Create New Session</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, themeState: ReturnType<typeof useThemeState>) =>
  StyleSheet.create({
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
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    titleActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
    deleteButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: theme.warning,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: themeState === 'dark' ? 'rgba(255, 77, 79, 0.08)' : 'rgba(255, 77, 79, 0.06)',
    },
    deleteButtonDisabled: {
      opacity: 0.5,
    },
    planLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.secondary,
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    planTitle: {
      flex: 1,
      marginRight: 12,
      fontSize: 22,
      fontWeight: '700',
      color: theme.text,
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
    startNewPlanLink: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    startNewPlanLinkText: {
      color: theme.secondary,
      fontSize: 13,
      fontWeight: '700',
    },
  });
