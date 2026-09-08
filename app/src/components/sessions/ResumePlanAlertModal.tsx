import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { SessionExercise } from '@/redux/api/sessionApi';
import { getPhaseNumber } from '@/utils/phase';

interface ResumePlanAlertModalProps {
  visible: boolean;
  onClose: () => void;
  onResume: () => void;
  onStartBeginning: () => void;
  resumeIndex: number;
  resumeExercise: SessionExercise | null;
  totalExercises: number;
}

export function ResumePlanAlertModal({
  visible,
  onClose,
  onResume,
  onStartBeginning,
  resumeIndex,
  resumeExercise,
  totalExercises,
}: ResumePlanAlertModalProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (!visible) return null;

  const phaseNumber = resumeExercise ? getPhaseNumber(resumeExercise.phase) : null;
  const exerciseName = resumeExercise?.exercise_name || 'Next Exercise';
  const exerciseNumText = `Exercise ${resumeIndex + 1} of ${totalExercises}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.card}>
              {/* Header Icon & Title */}
              <View style={styles.iconCircle}>
                <Feather name="play-circle" size={28} color={theme.secondary} />
              </View>

              <Text style={styles.title}>Start Movement Plan</Text>
              <Text style={styles.subtitle}>
                You have saved progress in this plan. Where would you like to start?
              </Text>

              {/* Left-Off Exercise Preview Card */}
              {resumeExercise && (
                <View style={styles.previewCard}>
                  <View style={styles.previewTopRow}>
                    <View style={styles.phaseBadge}>
                      <Text style={styles.phaseBadgeText}>
                        {phaseNumber ? `PHASE ${phaseNumber} • ` : ''}
                        {resumeExercise.phase.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.exerciseCounterText}>{exerciseNumText}</Text>
                  </View>
                  <Text style={styles.exerciseTitle} numberOfLines={2}>
                    {exerciseName}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {/* Where I Left Off (Primary) */}
                <TouchableOpacity
                  style={styles.primaryBtn}
                  activeOpacity={0.8}
                  onPress={onResume}
                >
                  <Feather name="arrow-right" size={18} color="#FFFFFF" style={styles.btnIcon} />
                  <Text style={styles.primaryBtnText}>Where I Left Off</Text>
                </TouchableOpacity>

                {/* Start from Beginning (Secondary) */}
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  activeOpacity={0.8}
                  onPress={onStartBeginning}
                >
                  <Feather name="rotate-ccw" size={16} color={theme.text} style={styles.btnIcon} />
                  <Text style={styles.secondaryBtnText}>Start from Beginning</Text>
                </TouchableOpacity>

                {/* Cancel (Tertiary Text) */}
                <TouchableOpacity
                  style={styles.cancelBtn}
                  activeOpacity={0.7}
                  onPress={onClose}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    card: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: theme.cardBackground,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 10,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(93, 230, 255, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    previewCard: {
      width: '100%',
      backgroundColor: theme.backgroundElement,
      borderRadius: 16,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },
    previewTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    phaseBadge: {
      backgroundColor: 'rgba(93, 230, 255, 0.15)',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    phaseBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.secondary,
      letterSpacing: 0.6,
    },
    exerciseCounterText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    exerciseTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    buttonContainer: {
      width: '100%',
      gap: 10,
    },
    primaryBtn: {
      width: '100%',
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.primary,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    secondaryBtn: {
      width: '100%',
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondaryBtnText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '700',
    },
    btnIcon: {
      marginRight: 8,
    },
    cancelBtn: {
      width: '100%',
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelBtnText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
